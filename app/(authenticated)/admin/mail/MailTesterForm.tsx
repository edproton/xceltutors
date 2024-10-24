"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Server,
  Lock,
  Mail,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { EmailFormData, emailSchema } from "./schemas";
import { pingSmtpServerAction, sendTestEmailAction } from "./actions";
import { SmtpServerInfo } from "@/services/email/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface MailTesterFormProps {
  smtpInfo: SmtpServerInfo;
}

export default function MailTesterForm({ smtpInfo }: MailTesterFormProps) {
  const [smtpStatus, setSmtpStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<Date | null>(null);

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      subject: "[TEST MAIL]",
      to: "",
      body: "",
    },
  });

  const pingSmtpServer = async () => {
    setSmtpStatus("loading");
    try {
      const result = await pingSmtpServerAction();
      setSmtpStatus(result.isSuccess ? "success" : "error");
      setLastPingTime(new Date());
    } catch (error) {
      setSmtpStatus("error");
      setLastPingTime(new Date());
    }
  };

  useEffect(() => {
    pingSmtpServer();
  }, []);

  const onSubmit = async (data: EmailFormData) => {
    console.log("teste");
    setIsSubmitting(true);
    const result = await sendTestEmailAction(data);

    if (result.isSuccess) {
      toast({
        title: "Success",
        description: result.data.message,
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  const getStatusIcon = () => {
    switch (smtpStatus) {
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (smtpStatus) {
      case "loading":
        return "Checking connection...";
      case "success":
        return "Connected";
      case "error":
        return "Connection failed";
    }
  };

  return (
    <div className="flex gap-4 w-full max-w-5xl mx-auto">
      <Card className="flex-1">
        <CardHeader className="pb-4">
          <CardTitle>Mail Tester</CardTitle>
          <CardDescription>
            Send a test email to verify your email configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="warning" className="py-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This form should only be used for testing the mail configuration.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body</FormLabel>
                    <FormControl>
                      <Textarea rows={8} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || smtpStatus === "error"}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Test Email"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="w-80">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4" />
              <CardTitle className="text-base">SMTP Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Server</Label>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <Mail className="h-3 w-3" />
                    <span className="text-xs">{smtpInfo.host}</span>
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Security
                </Label>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={smtpInfo.secure ? "default" : "secondary"}
                    className="space-x-1"
                  >
                    <Server className="h-3 w-3" />
                    <span>{smtpInfo.port}</span>
                  </Badge>
                  <Badge
                    variant={smtpInfo.secure ? "default" : "secondary"}
                    className="space-x-1"
                  >
                    <Lock className="h-3 w-3" />
                    <span>{smtpInfo.secure ? "SSL/TLS" : "None"}</span>
                  </Badge>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon()}
                    <span className="text-sm">{getStatusText()}</span>
                  </div>
                  {smtpStatus === "error" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={pingSmtpServer}
                      className="h-7 text-xs"
                    >
                      Retry
                    </Button>
                  )}
                </div>
                {lastPingTime && (
                  <div className="text-xs text-muted-foreground">
                    Last checked: {lastPingTime.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
