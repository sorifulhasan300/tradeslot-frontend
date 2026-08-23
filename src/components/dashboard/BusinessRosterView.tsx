'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  MapPin,
  Briefcase,
  RefreshCw,
  UserCheck,
  Mail,
  Phone,
  UserPlus,
  CalendarCheck,
  ShieldCheck,
  AlertCircle,
  X,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useBusinessDashboard, RosterMember } from '@/hooks/useBusinessDashboard';
import { authService } from '@/services/auth.service';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NumericPagination } from '@/components/shared/NumericPagination';

export function BusinessRosterView() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Add Technician Form State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    operatingPostcodeZone: 'EC1 / Central London',
    specialization: 'General Electrical & Plumbing Specialist',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Local additions to supplement API roster immediately
  const [localTechnicians, setLocalTechnicians] = useState<RosterMember[]>([]);

  const {
    roster: apiRoster,
    rosterSearch,
    setRosterSearch,
    isLoading,
    isFetching,
    refetchAll,
  } = useBusinessDashboard();

  // Combine API roster with newly added local technicians
  const combinedRoster = useMemo(() => {
    return [...localTechnicians, ...apiRoster];
  }, [localTechnicians, apiRoster]);

  // Filtered Roster by Search Term
  const filteredRoster = useMemo(() => {
    if (!rosterSearch.trim()) return combinedRoster;
    const term = rosterSearch.toLowerCase().trim();
    return combinedRoster.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        m.operatingPostcodeZone.toLowerCase().includes(term) ||
        m.specialization.toLowerCase().includes(term)
    );
  }, [combinedRoster, rosterSearch]);

  // Pagination calculations
  const paginatedRoster = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRoster.slice(start, start + pageSize);
  }, [filteredRoster, page]);

  const totalPages = Math.ceil(filteredRoster.length / pageSize) || 1;

  // Key Roster Metrics Cards
  const totalActiveTechnicians = combinedRoster.length;
  const coverageZonesCount = useMemo(() => {
    const zones = new Set(combinedRoster.map((m) => m.operatingPostcodeZone).filter(Boolean));
    return zones.size;
  }, [combinedRoster]);
  const totalAssignedBookings = useMemo(() => {
    return combinedRoster.reduce((sum, m) => sum + m.activeJobLoad, 0);
  }, [combinedRoster]);

  // Form Change Handler
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Form Validation Handler
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.length < 2) {
      errors.name = 'Full name must be at least 2 characters.';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errors.email = 'Please provide a valid email address.';
    }
    if (!formData.phone.trim() || formData.phone.length < 6) {
      errors.phone = 'Please provide a valid phone number.';
    }
    if (!formData.operatingPostcodeZone.trim()) {
      errors.operatingPostcodeZone = 'Primary work area / zone is required.';
    }
    if (!formData.specialization.trim()) {
      errors.specialization = 'Specialization or trade is required.';
    }
    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Initial password must be at least 6 characters.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler for Add Technician
  const handleAddTechnicianSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Register technician account via auth service
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'TRADER',
      });

      if (response.success) {
        const newMember: RosterMember = {
          id: response.data?.user?.id || `tech-${Date.now()}`,
          userId: response.data?.user?.id || `tech-${Date.now()}`,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          specialization: formData.specialization,
          operatingPostcodeZone: formData.operatingPostcodeZone,
          activeJobLoad: 0,
          completedJobsCount: 0,
          stripeConnected: false,
        };

        setLocalTechnicians((prev) => [newMember, ...prev]);
        toast.success(`Technician "${formData.name}" successfully registered and added to roster!`);
        setIsAddDialogOpen(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          operatingPostcodeZone: 'EC1 / Central London',
          specialization: 'General Electrical & Plumbing Specialist',
          password: '',
        });
        refetchAll();
      } else {
        toast.error(response.message || 'Failed to register technician.');
      }
    } catch (error: any) {
      toast.error(error?.message || 'An unexpected error occurred while adding technician.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-10 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400 bg-blue-500/10 font-medium">
              <Users className="h-3.5 w-3.5 mr-1" /> Team Management
            </Badge>
            <span className="text-xs text-muted-foreground">• Business Admin Roster Portal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Business Admin Team Roster
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor registered technicians, view operating postcode coverage, track active job dispatches, and register new traders.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refetchAll}
            disabled={isFetching}
            className="h-9 text-xs border-border/50 bg-background/40 hover:bg-background/80"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh Roster
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
            className="h-9 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20"
          >
            <UserPlus className="h-4 w-4 mr-1.5" />
            Add Technician
          </Button>
        </div>
      </div>

      {/* Roster Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Active Technicians Card */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Active Technicians
              </p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{totalActiveTechnicians}</p>
              <p className="text-[11px] text-blue-400 font-medium mt-0.5">Registered workforce</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Coverage Zones Count Card */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Coverage Zones Count
              </p>
              <p className="text-2xl font-bold text-emerald-400 mt-0.5">{coverageZonesCount}</p>
              <p className="text-[11px] text-emerald-400/80 font-medium mt-0.5">Postcode sectors served</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MapPin className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Total Assigned Bookings Card */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Assigned Bookings
              </p>
              <p className="text-2xl font-bold text-indigo-400 mt-0.5">{totalAssignedBookings}</p>
              <p className="text-[11px] text-indigo-400/80 font-medium mt-0.5">Active dispatch loads</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roster Controls & Technician Table */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden shadow-xl">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/30">
          <div>
            <CardTitle className="text-base font-bold text-foreground">Technician Roster Directory</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Search by technician name, specialization, or operating postcode coverage zone.
            </CardDescription>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter by name or coverage zone..."
              value={rosterSearch}
              onChange={(e) => {
                setRosterSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8 text-xs h-8 bg-background/50 border-border/40"
            />
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground">Technician Name</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Contact Info</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Primary Work Area</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Specialization</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-center">Active Bookings</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right">Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-border/30">
                    <TableCell><Skeleton className="h-4 w-32 bg-muted/40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40 bg-muted/40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28 bg-muted/40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36 bg-muted/40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 mx-auto bg-muted/40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 ml-auto bg-muted/40" /></TableCell>
                  </TableRow>
                ))
              ) : filteredRoster.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-44 text-center text-xs text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2 py-4">
                      <Users className="h-7 w-7 text-muted-foreground/60" />
                      <p>No technicians found matching &quot;{rosterSearch}&quot;</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRosterSearch('')}
                        className="text-xs text-primary hover:underline h-7"
                      >
                        Clear search filter
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRoster.map((member) => {
                  const isOnDuty = member.activeJobLoad > 0;

                  return (
                    <TableRow key={member.id} className="border-border/30 hover:bg-muted/20 transition-colors">
                      {/* Name */}
                      <TableCell className="font-medium text-xs text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 font-bold text-xs shrink-0 border border-blue-500/20">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground block">{member.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              ID: {member.id.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact Info */}
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Mail className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                            <span className="truncate max-w-[180px]">{member.email}</span>
                          </div>
                          {member.phone && member.phone !== 'N/A' && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 font-mono">
                              <Phone className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Primary Work Area */}
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/5 font-mono text-[11px]">
                          <MapPin className="h-3 w-3 mr-1 text-blue-400 shrink-0" />
                          {member.operatingPostcodeZone}
                        </Badge>
                      </TableCell>

                      {/* Specialization */}
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate max-w-[200px]" title={member.specialization}>
                            {member.specialization}
                          </span>
                        </div>
                      </TableCell>

                      {/* Active Bookings count */}
                      <TableCell className="text-xs text-center">
                        <Badge
                          variant="outline"
                          className={`text-xs px-2.5 py-0.5 font-semibold ${
                            isOnDuty
                              ? 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10'
                              : 'border-border text-muted-foreground bg-accent/20'
                          }`}
                        >
                          {member.activeJobLoad} Active {member.activeJobLoad === 1 ? 'Job' : 'Jobs'}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-xs text-right space-y-1">
                        <div className="flex justify-end items-center gap-1.5">
                          {isOnDuty ? (
                            <Badge className="bg-indigo-500/15 text-indigo-400 border-indigo-500/30 text-[10px]">
                              On Duty
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
                              Active / Available
                            </Badge>
                          )}
                        </div>

                        {member.stripeConnected ? (
                          <div className="flex justify-end">
                            <span className="text-[10px] text-emerald-400/90 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Stripe Express
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            <span className="text-[10px] text-amber-400/90 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> Pending Stripe
                            </span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <NumericPagination
          page={page}
          totalPages={totalPages}
          totalItems={filteredRoster.length}
          itemName="technicians"
          onPageChange={(p) => setPage(p)}
          className="p-4 border-t border-border/40"
        />
      </Card>

      {/* ADD TECHNICIAN DIALOG MODAL */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-card border border-border/60 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <UserPlus className="h-5 w-5 text-blue-400" /> Register & Assign New Technician
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a new technician or trader to your business roster. Registered technicians will receive active job dispatches in their assigned coverage area.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddTechnicianSubmit} className="space-y-4 py-2">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                Full Name <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g. Marcus Vance"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="text-xs h-9 bg-background/50 border-border/50"
              />
              {formErrors.name && (
                <p className="text-[11px] text-red-400 mt-0.5">{formErrors.name}</p>
              )}
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3 text-muted-foreground" /> Email Address <span className="text-red-400">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="technician@tradeslot.co.uk"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="text-xs h-9 bg-background/50 border-border/50"
                />
                {formErrors.email && (
                  <p className="text-[11px] text-red-400 mt-0.5">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3 text-muted-foreground" /> Phone Number <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="+44 7700 900123"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="text-xs h-9 bg-background/50 border-border/50"
                />
                {formErrors.phone && (
                  <p className="text-[11px] text-red-400 mt-0.5">{formErrors.phone}</p>
                )}
              </div>
            </div>

            {/* Coverage Zone & Specialization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" /> Primary Work Area <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="e.g. EC1 / Central London"
                  value={formData.operatingPostcodeZone}
                  onChange={(e) => handleInputChange('operatingPostcodeZone', e.target.value)}
                  className="text-xs h-9 bg-background/50 border-border/50"
                />
                {formErrors.operatingPostcodeZone && (
                  <p className="text-[11px] text-red-400 mt-0.5">{formErrors.operatingPostcodeZone}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Briefcase className="h-3 w-3 text-muted-foreground" /> Specialization / Trade <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="e.g. Electrical & Plumbing Specialist"
                  value={formData.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  className="text-xs h-9 bg-background/50 border-border/50"
                />
                {formErrors.specialization && (
                  <p className="text-[11px] text-red-400 mt-0.5">{formErrors.specialization}</p>
                )}
              </div>
            </div>

            {/* Initial Account Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Lock className="h-3 w-3 text-muted-foreground" /> Account Initial Password <span className="text-red-400">*</span>
              </label>
              <Input
                type="password"
                placeholder="Assign temporary password (min 6 chars)"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="text-xs h-9 bg-background/50 border-border/50"
              />
              {formErrors.password && (
                <p className="text-[11px] text-red-400 mt-0.5">{formErrors.password}</p>
              )}
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="text-xs font-semibold bg-primary text-primary-foreground"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                    Register & Add Technician
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BusinessRosterView;
