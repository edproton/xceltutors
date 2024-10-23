import { ErrorValues } from "@/lib/utils/actionUtils";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Errors } from "@/services/domainError";

const ErrorDialog = ({ error }: { error: ErrorValues }) => {
  return (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error === Errors.Server.InternalError
            ? "An unexpected error occurred. Please try again later."
            : error}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ErrorDialog;
