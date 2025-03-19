import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function PrivacyPage() {
  const privacyPolicyText = `Inkprov Privacy Policy

Last Updated: WED 19 March 2025

1. Introduction
Welcome to Inkprov! This Privacy Policy describes how Inkprov ("we," "us," or "our") collects, uses, and shares information about you when you use our website, www.inkprov.net (the "Site"), and the services offered through the Site (collectively, the "Services"). By using our Services, you agree to the terms of this Privacy Policy.

2. Information We Collect
We collect information about you in the following ways:

Information You Provide Directly:
• When you create an account, we collect your username, email address, and password.
• When you participate in collaborative writing projects, we collect the content you create and contribute.
• When you communicate with us, we collect your name, email address, and any other information you provide.
• If you use payment features, we collect payment information through our third party payment processors. (We do not store your credit card details)

Information Collected Automatically:
• Log Data: We collect information about your use of the Services, including your IP address, browser type, operating system, access times, and pages viewed.
• Cookies and Tracking Technologies: We use cookies and similar technologies to collect information about your browsing activities. You can control cookies through your browser settings.
• Usage Data: We collect data about how you interact with the site, including the frequency of use and features used.

Information From Third Parties:
• We may receive information about you from third-party services if you link, connect, or log in to your account with them (e.g., social media platforms).

3. How We Use Your Information
We use your information for the following purposes:
• To provide and maintain the Services.
• To personalize your experience on the Site.
• To communicate with you, including responding to your inquiries and providing support.
• To send you updates and promotional materials (you can opt out at any time).
• To monitor and analyze usage of the Services.
• To detect, prevent, and address technical issues and security vulnerabilities.
• To enforce our terms and conditions.
• To process payments.

4. Sharing Your Information
We may share your information with:
• Other Users: Content you contribute to collaborative writing projects is shared with other users participating in those projects.
• Service Providers: We share information with third-party service providers who assist us with hosting, payment processing, analytics, and other services.
• Legal Compliance: We may disclose information if required by law or in response to a valid legal request.
• Business Transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
• With your consent: We may share your information with third parties when we have your consent to do so.

5. Data Security
We take reasonable measures to protect your information from unauthorized access, use, or disclosure. However, no method of transmission over the internet or electronic storage is completely secure.

6. Data Retention
We retain your information for as long as necessary to provide the Services and as required by applicable law.

7. Your Rights
You have the following rights regarding your information:
• Access: You can access and update your account information.
• Correction: You can correct inaccuracies in your information.
• Deletion: You can request the deletion of your account and related information, subject to legal limitations.
• Opt-out: You can opt out of receiving promotional communications.
• Data portability: you can request a copy of your personal data.

To exercise these rights, please contact us at support@inkprov.net.

8. Children's Privacy
Our Services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete it.

9. Changes to This Privacy Policy
We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. Your continued use of the Services after any changes constitutes your acceptance of the new Privacy Policy.

10. Contact Us
If you have any questions about this Privacy Policy, please contact us at:
support@inkprov.net

INKPROV`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl tracking-tight font-extrabold text-primary-text sm:text-5xl md:text-6xl">
            <span className="block">Privacy</span>
            <span className="block text-indigo-600">Policy</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-secondary-text sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Last Updated: March 19, 2025
          </p>
        </div>

        <Card className="bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary-text">
              Inkprov Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={privacyPolicyText}
              readOnly
              className="min-h-[600px] font-mono text-sm text-secondary-text bg-white/50 resize-none"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
