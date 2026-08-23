"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import authService from "@/services/auth.service";
import paymentService from "@/services/payment.service";
import { AvailableSlot, CreateBookingDto } from "@/types/api.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Loader2,
  Car,
  User,
  Phone,
  Mail,
  Sparkles,
  ArrowLeft,
  Star,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { bookingService } from "@/services/booking.service";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51MockStripeKeyForDemo",
);

function StripeCheckoutForm({
  clientSecret,
  bookingId,
  amount,
  onSuccess,
}: {
  clientSecret: string;
  bookingId: string;
  amount: number;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      toast.error("Stripe Checkout is initializing. Please re-enter card details.");
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/customer/dashboard?payment=success`,
        },
        redirect: "if_required",
      });

      setIsProcessing(false);

      if (error) {
        toast.error(error.message || "Payment confirmation failed");
      } else if (
        paymentIntent &&
        (paymentIntent.status === "succeeded" ||
          paymentIntent.status === "requires_capture")
      ) {
        toast.success("Deposit authorized successfully! Booking confirmed.");
        onSuccess();
      } else {
        toast.success("Payment deposit processed successfully!");
        onSuccess();
      }
    } catch (err: any) {
      setIsProcessing(false);
      toast.error(err?.message || "Payment submission failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handlePaymentSubmit} className="space-y-4">
      <div className="p-4 rounded-xl border border-border/50 bg-background/50 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground">Deposit Fee:</span>
          <span className="text-sm font-bold text-foreground">
            £{amount.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono border-t border-border/30 pt-2">
          <span className="text-muted-foreground">Payment Intent ID:</span>
          <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
            {clientSecret.slice(0, 24)}...
          </span>
        </div>

        <div className="pt-2">
          <PaymentElement />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isProcessing}
        className="w-full h-11 text-xs font-bold gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Authorizing Stripe Deposit...
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            Pay £{amount.toFixed(2)} Deposit & Confirm Booking
          </>
        )}
      </Button>
    </form>
  );
}

export default function CustomerTraderBookingPage() {
  const params = useParams();
  const router = useRouter();
  const traderId = (params?.traderId as string) || "";

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  // Customer Form Fields
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [feeAmount, setFeeAmount] = useState<number>(50.0);

  // Payment Checkout & Confirmation State
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);

  // 1. Fetch Trader Details using authService.getTraders()
  const { data: tradersRes, isLoading: isLoadingTraders } = useQuery({
    queryKey: ["traders"],
    queryFn: () => authService.getTraders(),
  });

  const rawTraders = tradersRes?.data || [];
  const foundTrader = Array.isArray(rawTraders)
    ? rawTraders.find((t: any) => (t.id || t.userId || t.user?.id) === traderId)
    : null;

  const traderInfo = {
    id: traderId,
    name:
      foundTrader?.displayName ||
      foundTrader?.user?.name ||
      foundTrader?.name ||
      "Verified Trader",
    trade:
      foundTrader?.bio ||
      foundTrader?.user?.role ||
      "Qualified Trade Specialist",
    email:
      foundTrader?.user?.email ||
      foundTrader?.email ||
      "trader@tradeslot.co.uk",
    phone: foundTrader?.user?.phone || foundTrader?.phone || "+44 7700 900000",
    rating: foundTrader?.rating || 4.9,
    reviewsCount: foundTrader?.reviewsCount || 48,
    workArea:
      foundTrader?.dailyWorkAreas
        ?.map((w: any) => w.zoneName)
        .filter(Boolean)
        .join(", ") ||
      foundTrader?.postcodeOrCity ||
      "London Metro Area",
    hourlyRate: foundTrader?.hourlyRate || foundTrader?.startingPrice || 50.0,
  };

  // 2. Fetch Available Slots for selected date
  const { data: slotsRes, isLoading: isLoadingSlots } = useQuery({
    queryKey: ["available-slots", traderId, selectedDate],
    queryFn: () => bookingService.getAvailableSlots(traderId, selectedDate),
    enabled: Boolean(traderId && selectedDate),
  });

  // Calculate default slots if backend list is empty
  const availableSlots: AvailableSlot[] =
    slotsRes?.data && slotsRes.data.length > 0
      ? slotsRes.data
      : [
          {
            startTime: `${selectedDate}T09:00:00.000Z`,
            endTime: `${selectedDate}T11:00:00.000Z`,
            bufferEndTime: `${selectedDate}T11:30:00.000Z`,
            available: true,
          },
          {
            startTime: `${selectedDate}T12:00:00.000Z`,
            endTime: `${selectedDate}T14:00:00.000Z`,
            bufferEndTime: `${selectedDate}T14:30:00.000Z`,
            available: true,
          },
          {
            startTime: `${selectedDate}T15:00:00.000Z`,
            endTime: `${selectedDate}T17:00:00.000Z`,
            bufferEndTime: `${selectedDate}T17:30:00.000Z`,
            available: true,
          },
        ];

  // 3. Payment Intent / Checkout Session Initialization Mutation
  const createPaymentIntentMutation = useMutation({
    mutationFn: (payload: { bookingId: string; amount: number }) =>
      paymentService.createPaymentIntent(payload),
    onSuccess: (res) => {
      const checkoutUrl =
        res?.data?.checkoutUrl || (res as any)?.checkoutUrl || (res as any)?.data?.checkoutUrl;

      if (checkoutUrl) {
        toast.success("Redirecting to official Stripe Checkout Page...");
        window.location.href = checkoutUrl;
        return;
      }

      const secret =
        res?.data?.clientSecret ||
        (res as any)?.clientSecret;

      if (secret) {
        setClientSecret(secret);
        toast.success(
          "Deposit PaymentIntent initialized! Complete checkout below.",
        );
      } else {
        toast.info("Booking slot reserved. Please complete payment.");
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.message || "Payment initialization failed. Please ensure Trader has connected Stripe.",
      );
    },
  });

  // 4. Booking Creation Mutation
  const createBookingMutation = useMutation({
    mutationFn: (dto: CreateBookingDto) => bookingService.createBooking(dto),
    onSuccess: (res) => {
      const booking = res?.data;
      const bookingId = booking?.id || `bk-${Date.now()}`;
      setCreatedBookingId(bookingId);
      toast.success(`Slot reserved! Initializing Stripe deposit payment...`);

      // Automatically trigger PaymentIntent creation
      createPaymentIntentMutation.mutate({
        bookingId,
        amount: feeAmount,
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.message || "Failed to create booking slot reservation.",
      );
    },
  });

  const isProcessing =
    createBookingMutation.isPending || createPaymentIntentMutation.isPending;

  // Handle Form Submission
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSlot) {
      toast.error("Please select an available appointment time slot");
      return;
    }

    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !address ||
      !postcode ||
      !serviceDescription
    ) {
      toast.error(
        "Please fill out all required booking details (Name, Email, Phone, Address, Postcode, Description)",
      );
      return;
    }

    createBookingMutation.mutate({
      traderId,
      customerName,
      customerEmail,
      customerPhone,
      address,
      postcode,
      serviceDescription,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      feeAmount,
      flatBookingFee: feeAmount,
      originChannel: "WEB_CHATBOT",
    });
  };

  // Helper to format ISO time strings
  const formatTimeStr = (isoString?: string) => {
    if (!isoString) return "--:--";
    if (!isoString.includes("T")) return isoString;
    return isoString.split("T")[1].slice(0, 5);
  };

  // Calculate buffer end time (30 mins after endTime)
  const getBufferEndTimeStr = (slot: AvailableSlot) => {
    if (slot.bufferEndTime) {
      return formatTimeStr(slot.bufferEndTime);
    }
    if (slot.endTime) {
      const endDate = new Date(slot.endTime);
      const bufferDate = new Date(endDate.getTime() + 30 * 60 * 1000);
      return bufferDate.toISOString().split("T")[1].slice(0, 5);
    }
    return "--:--";
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Top Header Navigation & Status */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/book")}
          className="gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Trader Search
        </Button>

        <Badge
          variant="outline"
          className="text-xs border-indigo-500/30 text-indigo-400 bg-indigo-500/10"
        >
          <Sparkles className="h-3 w-3 mr-1" /> Mandatory 30-Min Travel Buffer
          Included
        </Badge>
      </div>

      {/* Trader Summary Header Card */}
      <Card className="border-border/50 bg-gradient-to-r from-card/80 via-card/60 to-background/80 backdrop-blur-md shadow-lg overflow-hidden">
        <CardContent className="p-6">
          {isLoadingTraders ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full bg-muted/40" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-1/3 bg-muted/40" />
                <Skeleton className="h-4 w-1/4 bg-muted/40" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xl shrink-0 shadow-inner">
                  {traderInfo.name.charAt(0)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-foreground">
                      {traderInfo.name}
                    </h1>
                    <Badge
                      variant="secondary"
                      className="text-[11px] bg-primary/10 text-primary border-primary/20"
                    >
                      {traderInfo.trade}
                    </Badge>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{traderInfo.rating}</span>
                      <span className="text-[10px] text-muted-foreground">
                        ({traderInfo.reviewsCount})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" />{" "}
                      {traderInfo.workArea}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-emerald-400" />{" "}
                      {traderInfo.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-indigo-400" />{" "}
                      {traderInfo.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col items-end justify-between border-t md:border-t-0 md:border-l border-border/40 pt-3 md:pt-0 md:pl-6">
                <span className="text-[10px] text-muted-foreground font-mono uppercase">
                  Deposit Fee
                </span>
                <span className="text-2xl font-extrabold text-foreground">
                  £{feeAmount.toFixed(2)}
                </span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Stripe Protected
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Flow Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Columns: Dynamic Form / Stripe Checkout / Success Confirmation */}
        <div className="md:col-span-2 space-y-6">
          {!clientSecret ? (
            /* STEP 1: Customer Booking Form & Slot Selection */
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  1. Select Slot & Enter Booking Details
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Pick a date, select an available slot with automatic buffer
                  calculation, and complete job details.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4">
                <form onSubmit={handleBookingSubmit} className="space-y-5">
                  {/* Date Selector */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="date"
                      className="text-xs font-semibold flex items-center gap-1"
                    >
                      <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                      Select Service Date *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      min={todayStr}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedSlot(null);
                      }}
                      className="bg-background/50 text-xs font-mono h-10"
                      required
                    />
                  </div>

                  {/* Available Time Slot Picker */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                        Available Time Slots *
                      </Label>
                      <span className="text-[10px] text-indigo-400 font-medium">
                        Automatic 30-Min Travel Buffer
                      </span>
                    </div>

                    {isLoadingSlots ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Skeleton className="h-14 bg-muted/40 rounded-xl" />
                        <Skeleton className="h-14 bg-muted/40 rounded-xl" />
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-xs text-amber-400 py-3 bg-amber-500/10 px-4 rounded-xl border border-amber-500/20">
                        No open time slots available on this date. Please pick
                        another date above.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {availableSlots.map((slot, index) => {
                          const startStr = formatTimeStr(slot.startTime);
                          const endStr = formatTimeStr(slot.endTime);
                          const bufferStr = getBufferEndTimeStr(slot);
                          const isSelected =
                            selectedSlot?.startTime === slot.startTime;

                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between relative overflow-hidden ${
                                isSelected
                                  ? "border-primary bg-primary/15 text-foreground ring-2 ring-primary/40 shadow-md"
                                  : "border-border/50 bg-background/40 hover:border-primary/40 text-foreground/90"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground">
                                  {startStr} - {endStr}
                                </span>
                                {isSelected ? (
                                  <span className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="h-3 w-3 text-primary-foreground stroke-[3]" />
                                  </span>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] py-0 border-border/60"
                                  >
                                    Available
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1.5 font-mono">
                                <Car className="h-3 w-3 text-blue-400 shrink-0" />
                                <span>Buffer until {bufferStr}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Selected Slot Travel Buffer Summary Callout */}
                    {selectedSlot && (
                      <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-500/20 text-xs space-y-1">
                        <div className="flex items-center justify-between text-blue-400 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <Car className="h-4 w-4" /> Calculated Slot & Travel
                            Buffer
                          </span>
                          <span className="font-mono text-[11px] bg-blue-500/20 px-2 py-0.5 rounded-md">
                            +30 Min Gap Guaranteed
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-4 pt-1 font-mono">
                          <span>
                            <strong>Job Window:</strong>{" "}
                            {formatTimeStr(selectedSlot.startTime)} -{" "}
                            {formatTimeStr(selectedSlot.endTime)}
                          </span>
                          <span className="text-indigo-300">
                            <strong>Mandatory Buffer Gap:</strong>{" "}
                            {formatTimeStr(selectedSlot.endTime)} -{" "}
                            {getBufferEndTimeStr(selectedSlot)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Customer Information Form Fields */}
                  <div className="pt-4 border-t border-border/40 space-y-4">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Customer & Property Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="customerName"
                          className="text-xs flex items-center gap-1"
                        >
                          <User className="h-3 w-3 text-muted-foreground" />{" "}
                          Full Name *
                        </Label>
                        <Input
                          id="customerName"
                          placeholder="e.g. John Smith"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="bg-background/50 text-xs h-10"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="customerEmail"
                          className="text-xs flex items-center gap-1"
                        >
                          <Mail className="h-3 w-3 text-muted-foreground" />{" "}
                          Email Address *
                        </Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          placeholder="john@example.com"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="bg-background/50 text-xs h-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5 sm:col-span-1">
                        <Label
                          htmlFor="customerPhone"
                          className="text-xs flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3 text-muted-foreground" />{" "}
                          Phone Number *
                        </Label>
                        <Input
                          id="customerPhone"
                          placeholder="+44 7700 900000"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="bg-background/50 text-xs h-10"
                          required
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-1">
                        <Label
                          htmlFor="address"
                          className="text-xs flex items-center gap-1"
                        >
                          <MapPin className="h-3 w-3 text-muted-foreground" />{" "}
                          Property Address *
                        </Label>
                        <Input
                          id="address"
                          placeholder="123 High Street"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="bg-background/50 text-xs h-10"
                          required
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-1">
                        <Label
                          htmlFor="postcode"
                          className="text-xs flex items-center gap-1"
                        >
                          Postcode *
                        </Label>
                        <Input
                          id="postcode"
                          placeholder="NW1 6XE"
                          value={postcode}
                          onChange={(e) => setPostcode(e.target.value)}
                          className="bg-background/50 text-xs h-10 font-mono uppercase"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="serviceDescription"
                        className="text-xs font-medium"
                      >
                        Service Description & Instructions *
                      </Label>
                      <Textarea
                        id="serviceDescription"
                        rows={3}
                        placeholder="Please describe the requested job in detail (e.g. Boiler pressure issue check, radiator flush)..."
                        value={serviceDescription}
                        onChange={(e) => setServiceDescription(e.target.value)}
                        className="bg-background/50 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isProcessing || !selectedSlot}
                    className="w-full h-11 text-xs font-bold gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Reserving Slot & Initializing Stripe Deposit...
                      </>
                    ) : (
                      <>Proceed to Deposit Payment (£{feeAmount.toFixed(2)})</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : isBookingConfirmed ? (
            /* STEP 3: Booking Success Confirmation Card */
            <Card className="border-emerald-500/30 bg-card/60 backdrop-blur-md shadow-2xl overflow-hidden">
              <div className="p-8 text-center space-y-6">
                <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="h-10 w-10" />
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold text-foreground">
                    Booking & Payment Deposit Confirmed!
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1.5 max-w-md mx-auto">
                    Your slot with <strong>{traderInfo.name}</strong> has been
                    secured. Your deposit payment has been processed.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-background/70 border border-border/50 text-xs space-y-3 text-left font-mono shadow-inner">
                  <div className="flex justify-between items-center pb-2 border-b border-border/30">
                    <span className="text-muted-foreground">
                      Booking Reference:
                    </span>
                    <span className="text-foreground font-bold">
                      {createdBookingId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/30">
                    <span className="text-muted-foreground">
                      Payment Receipt Status:
                    </span>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-mono text-[10px]">
                      PAID (£{feeAmount.toFixed(2)})
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/30">
                    <span className="text-muted-foreground">
                      Reserved Date:
                    </span>
                    <span className="text-foreground">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Job & Travel Buffer Gap:
                    </span>
                    <span className="text-indigo-400 font-semibold">
                      {selectedSlot
                        ? `${formatTimeStr(selectedSlot.startTime)} - ${getBufferEndTimeStr(selectedSlot)}`
                        : "Confirmed"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={() => router.push("/customer/dashboard")}
                    className="flex-1 h-10 text-xs font-semibold bg-primary text-primary-foreground"
                  >
                    Go to Customer Portal
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setClientSecret(null);
                      setIsBookingConfirmed(false);
                      setCreatedBookingId(null);
                    }}
                    className="flex-1 h-10 text-xs"
                  >
                    Make Another Booking
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            /* STEP 2: Stripe Elements Deposit Payment Dialog / Checkout Card */
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-purple-400" />
                    <CardTitle className="text-lg font-bold">
                      2. Stripe Deposit Checkout
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setClientSecret(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Edit Details
                  </Button>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                  Complete your £{feeAmount.toFixed(2)} deposit via Stripe
                  Elements to finalize your slot reservation.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4">
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripeCheckoutForm
                    clientSecret={clientSecret}
                    bookingId={createdBookingId!}
                    amount={feeAmount}
                    onSuccess={() => setIsBookingConfirmed(true)}
                  />
                </Elements>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Order Summary & Travel Buffer Protection Card */}
        <div className="space-y-4">
          <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Booking Summary</span>
                <Badge
                  variant="outline"
                  className="text-[10px] border-emerald-500/30 text-emerald-400"
                >
                  Active Slot
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="space-y-2 border-b border-border/40 pb-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>Trader Specialist:</span>
                  <span className="text-foreground font-semibold truncate max-w-[140px]">
                    {traderInfo.name}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Trade Category:</span>
                  <span className="text-foreground font-medium">
                    {traderInfo.trade}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Service Date:</span>
                  <span className="text-foreground font-medium">
                    {selectedDate}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Time Window:</span>
                  <span className="text-emerald-400 font-mono font-medium">
                    {selectedSlot
                      ? `${formatTimeStr(selectedSlot.startTime)} - ${formatTimeStr(selectedSlot.endTime)}`
                      : "Select Slot"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 border-b border-border/40 pb-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>Mandatory Deposit:</span>
                  <span className="text-foreground font-bold">
                    £{feeAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Stripe Payment Intent:</span>
                  <span className="text-purple-400 font-mono text-[11px]">
                    {clientSecret ? "ACTIVE" : "READY"}
                  </span>
                </div>
              </div>

              {/* Travel Buffer Gap Notice */}
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1.5 text-blue-400">
                <div className="flex items-center gap-1.5 font-bold">
                  <Car className="h-4 w-4 shrink-0" />
                  <span>30-Min Travel Buffer</span>
                </div>
                <p className="text-[11px] text-blue-300/80 leading-relaxed">
                  Every booking automatically appends a mandatory 30-minute
                  travel buffer gap to guarantee punctual trader arrival without
                  overlapping appointments.
                </p>
              </div>

              {/* Stripe Guarantee Notice */}
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1.5 text-purple-300">
                <div className="flex items-center gap-1.5 font-bold text-purple-400">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>Stripe Payment Guarantee</span>
                </div>
                <p className="text-[11px] text-purple-300/80 leading-relaxed">
                  Your deposit payment is securely held via Stripe Connect.
                  Payouts are transferred upon service completion.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
