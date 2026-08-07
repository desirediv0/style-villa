import { PageHero } from "@/components/ui/PageHero";
import { BadgeAlert, RefreshCw, ShieldCheck, Video, Camera, Clock, Mail, MessageSquare, AlertTriangle, XCircle, RotateCcw, Truck } from "lucide-react";

export const metadata = {
  title: "Return & Refund Policy | Style Villa",
  description: "Read Style Villa's return, exchange, replacement, refund, reverse pickup, order cancellation, and damaged item policies.",
};

const returnSteps = [
  {
    step: 1,
    title: "Report Within 24-48 hrs",
    description: "Notify our team via Email or WhatsApp with your Order ID."
  },
  {
    step: 2,
    title: "360° Video & Photos",
    description: "Provide complete unboxing video and clear packaging photos."
  },
  {
    step: 3,
    title: "Verification & Pickup",
    description: "Our quality team reviews details and schedules reverse pickup."
  },
  {
    step: 4,
    title: "Replacement / Refund",
    description: "Priority replacement or refund initiated within 24 hours of approval."
  }
];

export default function ReturnPolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <PageHero
        title="Return & Refund Policy"
        description="Our commitment to product quality, transparent guidelines, and hassle-free resolutions"
        breadcrumbs={[{ label: "Return Policy" }]}
        variant="default"
        size="sm"
      />

      <section className="py-12 md:py-16 px-5 sm:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto space-y-10">

          {/* Intro Card */}
          <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-200/80 shadow-sm space-y-4">
            <h2 className="text-2xl font-extrabold text-gray-900">
              Welcome to Style Villa
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              At Style Villa, we are committed to delivering products that reflect the highest standards of quality and style. Every order is carefully inspected and thoughtfully packed before it leaves our facility to ensure it reaches you in excellent condition. We encourage you to review our policy before placing your order.
            </p>
          </div>

          {/* Return Workflow */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm">
            <h2 className="font-display text-xl text-gray-900 mb-8 text-center flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-600" /> Resolution Workflow
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {returnSteps.map((item) => (
                <div key={item.step} className="text-center relative">
                  <div className="w-12 h-12 bg-purple-50 text-purple-700 border border-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-base">
                    {item.step}
                  </div>
                  <h3 className="text-gray-900 text-sm font-bold mb-1.5">{item.title}</h3>
                  <p className="text-gray-500 text-xs leading-normal px-2">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Detail Sections */}
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200/80 shadow-sm space-y-10">

            {/* Return & Exchange Policy */}
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-purple-600 rounded-full" />
                Return &amp; Exchange Policy
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                We understand that shopping online is built on trust, and we sincerely appreciate the confidence you place in us. To uphold the highest standards of product quality and hygiene, we are unable to accept returns or exchanges for reasons such as a <strong className="text-gray-900">change of mind, incorrect size selection, or color preference</strong> once an order has been shipped or delivered.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                Your satisfaction remains our priority. In the unlikely event that:
              </p>
              <ul className="space-y-2 pl-5 list-disc text-sm text-gray-700 font-medium">
                <li>You receive a damaged or defective product, or</li>
                <li>You receive an incorrect item,</li>
              </ul>
              <p className="text-gray-600 text-sm leading-relaxed mt-3">
                Our team will be happy to assist you with a replacement after reviewing and verifying the details of your request.
              </p>
            </div>

            {/* Conditions for Replacement */}
            <div className="bg-purple-50/50 p-6 md:p-8 rounded-3xl border border-purple-100/70">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-600" />
                Conditions for Replacement (Damaged / Defective / Incorrect Items)
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                To help us resolve your request as quickly and efficiently as possible, please ensure the following requirements are met:
              </p>
              <ul className="space-y-3 text-xs md:text-sm text-gray-700">
                <li className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-purple-100">
                  <Clock className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span><strong>24-Hour Reporting Window:</strong> The issue is reported within 24 hours of delivery.</span>
                </li>
                <li className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-purple-100">
                  <Video className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span><strong>360° Unboxing Video:</strong> A complete 360° unboxing video is provided, starting from the opening of the sealed package and clearly showing the product.</span>
                </li>
                <li className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-purple-100">
                  <Camera className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Detailed Photographs:</strong> Clear photographs of the product, the issue, and both outer and inner packaging are shared along with label details.</span>
                </li>
                <li className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-purple-100">
                  <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Original Materials Retained:</strong> The original packaging, tags, and invoice are retained until your request has been reviewed and resolved.</span>
                </li>
              </ul>
              <p className="text-xs text-gray-500 mt-4 italic">
                These requirements help us verify the issue accurately and ensure a fair and timely resolution for all customers.
              </p>
            </div>

            {/* Contact for Claims */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 space-y-4">
              <h3 className="text-lg font-bold text-purple-300">Reach Out to Support</h3>
              <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                To help us assist you promptly, please include your <strong>Order ID</strong>, clear photographs of the product, and a link to the complete unboxing video when submitting your request:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <a href="mailto:stylevilla.ktl@gmail.com" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-xs md:text-sm text-white font-medium transition-all">
                  <Mail className="w-4 h-4 text-purple-400" /> Email: stylevilla.ktl@gmail.com
                </a>
                <a href="https://wa.me/919896400453" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-xl text-xs md:text-sm text-white font-medium transition-all">
                  <MessageSquare className="w-4 h-4" /> WhatsApp: +91 9896400453
                </a>
              </div>
            </div>

            {/* Refunds */}
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-sky-500 rounded-full" />
                Refunds
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Once your claim has been reviewed and approved, we strive to ensure the refund process is smooth, transparent, and hassle-free.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-1">Prepaid Orders</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    The refund amount will be credited back to the original mode of payment or the shared account details.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-1">Cash on Delivery (COD) Orders</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Refunds for eligible COD orders will be processed via bank transfer or UPI after successful verification.
                  </p>
                </div>
              </div>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed bg-sky-50 p-4 rounded-2xl border border-sky-100">
                <strong>Refund Timeline:</strong> Once your refund has been approved, it will be initiated within <strong>24 hours</strong>. Depending on your bank or payment service provider, it may take <strong>5–7 business days</strong> for the amount to be credited to your account.
              </p>
            </div>

            {/* Reverse Pickup & Shipping */}
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-600" />
                Reverse Pickup &amp; Shipping
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                For approved replacement cases, we&apos;ll gladly arrange a reverse pickup wherever our logistics partners offer the service.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                If your PIN code is not serviceable for pickup, we&apos;ll guide you on how to self-ship the item, and once received, we&apos;ll reimburse standard courier charges upon submission of a valid courier receipt.
              </p>
            </div>

            {/* Order Cancellations */}
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-purple-600" />
                Order Cancellations
              </h2>
              <div className="space-y-3 text-xs md:text-sm text-gray-600">
                <p>
                  <strong className="text-gray-900">Before Dispatch:</strong> Orders may be cancelled before they are dispatched and will be eligible for a full refund.
                </p>
                <p>
                  <strong className="text-gray-900">After Dispatch:</strong> Once an order has been shipped, it cannot be cancelled/changed/exchanged. If you choose to refuse delivery, any applicable refund will be subject to product inspection and approval. Shipping and handling charges, where applicable, may be deducted from the refund amount.
                </p>
                <p className="text-gray-500 italic">
                  If you need to cancel or make changes to your order, we recommend contacting our support team as soon as possible before your order is dispatched.
                </p>
              </div>
            </div>

            {/* Tampered / Opened / Damaged Package Delivery */}
            <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200/80 space-y-3">
              <div className="flex gap-3 items-center text-amber-900 font-bold text-base">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span>Tampered, Opened, or Damaged Delivery Policy</span>
              </div>
              <p className="text-xs md:text-sm text-amber-950 leading-relaxed">
                If your order arrives in a tampered, opened, or damaged condition, or if any items are missing from the package, please retain all packaging materials and do not discard them.
              </p>
              <p className="text-xs md:text-sm text-amber-950 leading-relaxed font-semibold">
                Kindly contact us within 48 hours of delivery and provide the following details:
              </p>
              <ul className="list-disc pl-5 text-xs md:text-sm text-amber-900 space-y-1">
                <li>A complete unboxing video showing the package opening and the contents received.</li>
                <li>Clear photographs of the outer packaging, inner packaging, and the product(s) received.</li>
              </ul>
              <p className="text-xs text-amber-800">
                Our team will promptly review the details, investigate the matter on priority, and work towards providing an appropriate resolution.
              </p>
            </div>

            {/* Non-Returnable Items */}
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" />
                Non-Returnable Items
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                We cannot accept returns or exchanges on items that have been:
              </p>
              <ul className="space-y-2 pl-5 list-disc text-xs md:text-sm text-gray-700">
                <li>Physically damaged by customer</li>
                <li>Altered from their original state based on your specifications</li>
                <li>Worn or used</li>
              </ul>
            </div>

            {/* Note */}
            <div className="pt-6 border-t border-gray-100 bg-gray-50 p-6 rounded-2xl">
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong>Note:</strong> All return, replacement, and refund claims are carefully reviewed by our quality team to ensure fairness and transparency. We appreciate your understanding and cooperation in helping us maintain a smooth and trustworthy process for all our customers.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

