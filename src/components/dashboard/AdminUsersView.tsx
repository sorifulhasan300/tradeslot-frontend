"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  CheckCircle2,
  RefreshCw,
  Mail,
  Phone,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  User,
  Wrench,
  Briefcase,
  MoreVertical,
  Shield,
  KeyRound,
  UserCog,
  Check,
} from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { userService } from "@/services/user.service";
import { User as UserType, UserRole } from "@/types/auth.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { NumericPagination } from "@/components/shared/NumericPagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdminUsersViewProps {
  initialUser?: UserType | null;
}

export function AdminUsersView({ initialUser }: AdminUsersViewProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [roleTab, setRoleTab] = useState<
    "ALL" | "CUSTOMER" | "TRADER" | "BUSINESS_ADMIN" | "PLATFORM_ADMIN"
  >("ALL");

  // State for Role Change Modal
  const [selectedUserForRole, setSelectedUserForRole] = useState<UserType | null>(null);
  const [targetRole, setTargetRole] = useState<UserRole>("CUSTOMER");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Fetch Summary statistics for Metrics Overview Cards
  const { data: summaryRes } = useQuery({
    queryKey: ["admin-users-summary"],
    queryFn: () => userService.getAllUsers({ limit: 1000 }),
  });

  const allUsersSummary: UserType[] = summaryRes?.data || [];
  const totalUsersCount = summaryRes?.meta?.total ?? allUsersSummary.length;
  const customersCount = allUsersSummary.filter((u) => u.role === "CUSTOMER").length;
  const tradersCount = allUsersSummary.filter((u) => u.role === "TRADER").length;
  const businessAdminsCount = allUsersSummary.filter((u) => u.role === "BUSINESS_ADMIN").length;

  // Main User Table Query
  const {
    data: usersRes,
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["admin-users", page, roleTab, userSearch],
    queryFn: () =>
      userService.getAllUsers({
        page,
        limit: 10,
        role: roleTab === "ALL" ? undefined : roleTab,
        searchTerm: userSearch || undefined,
      }),
  });

  const users: UserType[] = usersRes?.data || [];

  // Mutation to update user status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, emailVerified }: { id: string; status: "ACTIVE" | "SUSPENDED"; emailVerified: boolean }) =>
      userService.updateUserStatus(id, { status, emailVerified }),
    onSuccess: (data, variables) => {
      toast.success(
        `Account status updated to ${variables.status === "ACTIVE" ? "Active" : "Suspended"}`
      );
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-summary"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update account status");
    },
  });

  // Mutation to update user role
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      userService.updateUserRole(id, role),
    onSuccess: (_, variables) => {
      toast.success(`User role successfully changed to ${variables.role}`);
      setIsRoleModalOpen(false);
      setSelectedUserForRole(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-summary"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update user role");
    },
  });

  const handleRefresh = () => {
    refetchUsers();
    queryClient.invalidateQueries({ queryKey: ["admin-users-summary"] });
    toast.info("Refreshed user directory");
  };

  const handleOpenRoleModal = (user: UserType) => {
    setSelectedUserForRole(user);
    setTargetRole(user.role);
    setIsRoleModalOpen(true);
  };

  const handleConfirmRoleChange = () => {
    if (!selectedUserForRole) return;
    updateRoleMutation.mutate({ id: selectedUserForRole.id, role: targetRole });
  };

  const handleToggleStatus = (user: UserType) => {
    const isCurrentlyActive = Boolean(user.emailVerified);
    const nextStatus = isCurrentlyActive ? "SUSPENDED" : "ACTIVE";
    updateStatusMutation.mutate({
      id: user.id,
      status: nextStatus,
      emailVerified: !isCurrentlyActive,
    });
  };

  const handleSendPasswordReset = async (email: string) => {
    const res = await userService.sendPasswordResetLink(email);
    if (res.success) {
      toast.success(`Verification code dispatched to ${email}`, {
        description: `Direct user to: /verify-email?email=${encodeURIComponent(email)}`,
      });
    } else {
      toast.error(res.message || "Failed to send password reset link");
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    try {
      return format(parseISO(isoString), "MMM d, yyyy");
    } catch {
      return isoString;
    }
  };

  const getRoleBadge = (role: UserRole | string) => {
    const r = String(role).toUpperCase();
    if (r === "PLATFORM_ADMIN" || r === "ADMIN") {
      return (
        <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 gap-1 font-mono text-[11px]">
          <Shield className="h-3 w-3" />
          {r}
        </Badge>
      );
    }
    if (r === "BUSINESS_ADMIN") {
      return (
        <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 gap-1 font-mono text-[11px]">
          <Briefcase className="h-3 w-3" />
          BUSINESS ADMIN
        </Badge>
      );
    }
    if (r === "TRADER") {
      return (
        <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 gap-1 font-mono text-[11px]">
          <Wrench className="h-3 w-3" />
          TRADER
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1 font-mono text-[11px]">
        <User className="h-3 w-3" />
        CUSTOMER
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="text-xs border-primary/20 text-primary bg-primary/10"
            >
              <UserCog className="h-3.5 w-3.5 mr-1" /> Dedicated Admin Route
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Platform User Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            System-wide audit panel for managing platform accounts, changing system roles, toggling verification status, and triggering credential resets.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetchingUsers}
            className="h-9 text-xs border-border/50 bg-background/40 hover:bg-background/80"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5 mr-1.5", isFetchingUsers && "animate-spin")}
            />
            Refresh Users
          </Button>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
          >
            Dashboard Overview <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* METRICS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="glass-card glass-card-hover">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground">{totalUsersCount}</p>
              <p className="text-[11px] text-muted-foreground">Registered accounts</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="glass-card glass-card-hover">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold text-emerald-400">{customersCount}</p>
              <p className="text-[11px] text-emerald-400/80 font-medium">Consumer accounts</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <User className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Total Traders */}
        <Card className="glass-card glass-card-hover">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Traders</p>
              <p className="text-2xl font-bold text-blue-400">{tradersCount}</p>
              <p className="text-[11px] text-blue-400/80 font-medium">Trade specialists</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Wrench className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Total Business Admins */}
        <Card className="glass-card glass-card-hover">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Business Admins</p>
              <p className="text-2xl font-bold text-amber-400">{businessAdminsCount}</p>
              <p className="text-[11px] text-amber-400/80 font-medium">Agency managers</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Briefcase className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* USER AUDIT TABLE CARD */}
      <Card className="glass-card">
        <CardHeader className="pb-4 border-b border-border/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <UserCog className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">User Audit Directory</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Audit, filter, and manage permissions for all registered accounts across TradeSlot
                </CardDescription>
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center p-1 rounded-lg bg-background/60 border border-border/50 text-xs shrink-0 overflow-x-auto">
                {(
                  [
                    { key: "ALL", label: "All" },
                    { key: "CUSTOMER", label: "Customers" },
                    { key: "TRADER", label: "Traders" },
                    { key: "BUSINESS_ADMIN", label: "Business" },
                    { key: "PLATFORM_ADMIN", label: "Admins" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setRoleTab(tab.key);
                      setPage(1);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-md font-medium transition-all text-xs whitespace-nowrap",
                      roleTab === tab.key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search name, email, phone..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-8 text-xs bg-background/50 h-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {isLoadingUsers && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-border/40 bg-card/40 flex justify-between items-center"
                >
                  <Skeleton className="h-5 w-48 bg-muted/40" />
                  <Skeleton className="h-5 w-28 bg-muted/30" />
                  <Skeleton className="h-5 w-24 bg-muted/30" />
                  <Skeleton className="h-6 w-20 bg-muted/30 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {!isLoadingUsers && users.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-border/60 bg-background/20 space-y-3">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {userSearch || roleTab !== "ALL"
                  ? "No users match your current search and role filters."
                  : "No registered users currently in the system database."}
              </p>
            </div>
          )}

          {!isLoadingUsers && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-[11px] font-mono uppercase tracking-wider text-muted-foreground bg-muted/20">
                    <th className="py-3 px-4 rounded-l-lg">Name & Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Role Badge</th>
                    <th className="py-3 px-4">Verification Status</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right rounded-r-lg">Action Menu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-xs">
                  {users.map((user) => {
                    const isVerified = Boolean(user.emailVerified);

                    return (
                      <tr key={user.id} className="hover:bg-background/60 transition-colors group">
                        {/* Name & Email */}
                        <td className="py-3.5 px-4 font-semibold text-foreground">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0 border border-primary/20">
                              {(user.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="truncate block">{user.name || "Unnamed User"}</span>
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono font-normal">
                                <Mail className="h-3 w-3 shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                          {user.phone ? (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground/70" />
                              <span>{user.phone}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50">N/A</span>
                          )}
                        </td>

                        {/* Role Badge */}
                        <td className="py-3.5 px-4">{getRoleBadge(user.role)}</td>

                        {/* Verification Status */}
                        <td className="py-3.5 px-4">
                          {isVerified ? (
                            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1 font-mono text-[11px]">
                              <CheckCircle2 className="h-3 w-3" />
                              ACTIVE / VERIFIED
                            </Badge>
                          ) : (
                            <Badge
                              variant="destructive"
                              className="bg-red-500/15 text-red-400 border-red-500/30 gap-1 font-mono text-[11px]"
                            >
                              <ShieldAlert className="h-3 w-3" />
                              SUSPENDED / UNVERIFIED
                            </Badge>
                          )}
                        </td>

                        {/* Created Date */}
                        <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                          {formatDate(user.createdAt)}
                        </td>

                        {/* Action Menu */}
                        <td className="py-3.5 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground border border-border/40 bg-background/30 hover:bg-background/60 transition-colors cursor-pointer">
                              <MoreVertical className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 bg-card border border-border/60">
                              <DropdownMenuLabel className="text-[11px] font-mono text-muted-foreground">
                                Manage Account #{user.id ? user.id.slice(-6) : ""}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              
                              {/* Change Role */}
                              <DropdownMenuItem
                                onClick={() => handleOpenRoleModal(user)}
                                className="cursor-pointer text-xs flex items-center gap-2"
                              >
                                <UserCog className="h-3.5 w-3.5 text-purple-400" />
                                <span>Change System Role</span>
                              </DropdownMenuItem>

                              {/* Toggle Active / Suspended */}
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(user)}
                                className="cursor-pointer text-xs flex items-center gap-2"
                              >
                                {isVerified ? (
                                  <>
                                    <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                                    <span>Suspend Account</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>Activate Account</span>
                                  </>
                                )}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              {/* Send Password Reset Link */}
                              <DropdownMenuItem
                                onClick={() => handleSendPasswordReset(user.email)}
                                className="cursor-pointer text-xs flex items-center gap-2"
                              >
                                <KeyRound className="h-3.5 w-3.5 text-blue-400" />
                                <span>Send Password Reset</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* NUMERIC PAGINATION FOOTER */}
          <NumericPagination
            page={page}
            totalPages={usersRes?.meta?.totalPage || usersRes?.meta?.totalPages || 1}
            totalItems={usersRes?.meta?.total ?? users.length}
            itemName="users"
            onPageChange={(newPage) => setPage(newPage)}
            className="mt-4"
          />
        </CardContent>
      </Card>

      {/* CHANGE ROLE DIALOG / MODAL */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border/60">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <UserCog className="h-4 w-4 text-purple-400" /> Change User Role
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify permissions and portal access level for{" "}
              <strong className="text-foreground">{selectedUserForRole?.name}</strong> ({selectedUserForRole?.email}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Select New Access Role:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {(
                [
                  { role: "CUSTOMER", title: "Customer Portal", desc: "Can search traders, book services, and review history" },
                  { role: "TRADER", title: "Trader Portal", desc: "Can manage work area, receive bookings, and request payouts" },
                  { role: "BUSINESS_ADMIN", title: "Business Admin", desc: "Can manage agency team roster, schedule, and company payouts" },
                  { role: "PLATFORM_ADMIN", title: "Platform Admin", desc: "Full executive access across system audit, revenue, & users" },
                ] as const
              ).map((option) => {
                const isSelected = targetRole === option.role;
                return (
                  <div
                    key={option.role}
                    onClick={() => setTargetRole(option.role as UserRole)}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between",
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/40 bg-background/30 text-muted-foreground hover:bg-background/60 hover:text-foreground"
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{option.title}</span>
                        {getRoleBadge(option.role)}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{option.desc}</p>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRoleModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmRoleChange}
              disabled={updateRoleMutation.isPending}
              className="text-xs font-semibold"
            >
              {updateRoleMutation.isPending ? "Updating Role..." : "Confirm Role Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminUsersView;
