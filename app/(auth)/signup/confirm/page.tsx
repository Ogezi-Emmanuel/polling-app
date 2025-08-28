import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function ConfirmEmailPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[400px] text-center">
        <CardHeader>
          <CardTitle>Confirm Your Email</CardTitle>
          <CardDescription>A confirmation link has been sent to your email address.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Please check your inbox and click the link to activate your account.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            You may close this page now.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}