import ErrorDialog from "@/components/ui/error-dialog";
import { getSmtpServerInfoAction } from "./actions";
import MailTesterForm from "./MailTesterForm";

export default async function MailTesterWrapper() {
  const smtpInfoResult = await getSmtpServerInfoAction();

  if (!smtpInfoResult.isSuccess) {
    return <ErrorDialog error={smtpInfoResult.error} />;
  }

  return <MailTesterForm smtpInfo={smtpInfoResult.data} />;
}
