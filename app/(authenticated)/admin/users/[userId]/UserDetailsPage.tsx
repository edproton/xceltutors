"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  updateUser,
  addUserRole,
  removeUserRole,
  unlinkProvider,
} from "./actions";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/providers/user-provider";
import { Role, UserWithRoles } from "./types";
import { UserType } from "@/db/schemas/userSchema";
import { authProviders } from "@/components/constants/auth-providers";
import { AuthProvider } from "@/services/auth/providers/types";

interface UserDetailsPageProps {
  user: UserWithRoles & {
    googleId: string | null;
    discordId: string | null;
  };
  availableRoles: Role[];
}

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  isActive: z.boolean(),
  type: z.nativeEnum(UserType).nullable(),
});

const roleFormSchema = z.object({
  roleId: z.string(),
});

export default function UserDetailsPage({
  user,
  availableRoles,
}: UserDetailsPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState(user.roles);
  const { user: currentUser } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActive: user.isActive,
      type: user.type || null,
    },
  });

  const roleForm = useForm<z.infer<typeof roleFormSchema>>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      roleId: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const result = await updateUser(user.id, values);

    if (result.isSuccess) {
      toast({
        title: "User updated",
        description: "The user details have been successfully updated.",
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        description:
          result.error ||
          "There was an error updating the user. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  }

  async function onAddRole(values: z.infer<typeof roleFormSchema>) {
    const result = await addUserRole(user.id, parseInt(values.roleId));

    if (result.isSuccess) {
      const newRole = availableRoles.find(
        (r) => r.id === parseInt(values.roleId)
      );
      if (newRole) {
        setRoles([...roles, newRole]);
        toast({
          title: "Role added",
          description: "The role has been successfully added to the user.",
        });
        roleForm.reset();
      }
    } else {
      toast({
        title: "Error",
        description:
          result.error ||
          "There was an error adding the role. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function onRemoveRole(roleId: number) {
    const result = await removeUserRole(user.id, roleId);
    if (result.isSuccess) {
      setRoles(roles.filter((role) => role.id !== roleId));
      toast({
        title: "Role removed",
        description: "The role has been successfully removed from the user.",
      });
    } else {
      toast({
        title: "Error",
        description:
          result.error ||
          "There was an error removing the role. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function onUnlinkProvider(provider: AuthProvider) {
    const result = await unlinkProvider(user.id, provider);
    if (result.isSuccess) {
      toast({
        title: "Provider unlinked",
        description: `The ${provider} account has been successfully unlinked.`,
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        description:
          result.error ||
          `There was an error unlinking the ${provider} account. Please try again.`,
        variant: "destructive",
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <Avatar className="w-20 h-20">
            <AvatarImage
              src={user.picture || undefined}
              alt={`${user.firstName} ${user.lastName}`}
            />
            <AvatarFallback>
              {user.firstName[0]}
              {user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-2">
              {roles.map((role) => (
                <Badge key={role.id} variant="secondary">
                  {role.name}
                  <button
                    onClick={() => onRemoveRole(role.id)}
                    className="ml-2 text-xs text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>User Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) =>
                          field.onChange(value === "" ? null : value)
                        }
                        value={field.value || ""}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={UserType.Student} />
                          </FormControl>
                          <FormLabel className="font-normal">Student</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={UserType.Tutor} />
                          </FormControl>
                          <FormLabel className="font-normal">Tutor</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="" />
                          </FormControl>
                          <FormLabel className="font-normal">None</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <h3 className="text-sm font-medium mb-2">Linked Providers</h3>
                <div className="space-y-2">
                  {authProviders.map((provider) => (
                    <div
                      key={provider.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        {provider.icon}
                        <span>{provider.name}</span>
                      </div>
                      {(provider.name === AuthProvider.Google &&
                        user.googleId) ||
                      (provider.name === AuthProvider.Discord &&
                        user.discordId) ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Unlink
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Unlink {provider.name} Account
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to unlink the{" "}
                                {provider.name} account from this user? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onUnlinkProvider(provider.name)}
                              >
                                Unlink
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Badge variant="outline">Not linked</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Determine if the user account is active or inactive.
                      {user.id === currentUser.id && (
                        <span className="text-yellow-600">
                          {" "}
                          You cannot deactivate your own account.
                        </span>
                      )}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={user.id === currentUser.id}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update User"}
            </Button>
          </form>
        </Form>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Manage Roles</h3>

          {availableRoles.length !== user.roles.length ? (
            <Form {...roleForm}>
              <form
                onSubmit={roleForm.handleSubmit(onAddRole)}
                className="space-y-4"
              >
                <FormField
                  control={roleForm.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Add Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableRoles
                            .filter(
                              (role) =>
                                !roles.some(
                                  (userRole) => userRole.id === role.id
                                )
                            )
                            .map((role) => (
                              <SelectItem
                                key={role.id}
                                value={role.id.toString()}
                              >
                                {role.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={!roleForm.watch("roleId")}>
                  Add Role
                </Button>
              </form>
            </Form>
          ) : (
            <p className="text-muted-foreground">
              This user has all available roles assigned.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
