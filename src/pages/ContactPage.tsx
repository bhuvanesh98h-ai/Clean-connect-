import React, { useState } from 'react';
import { useCleanConnect } from '../context/CleanConnectContext';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { submitContactInquiry } = useCleanConnect();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Please provide your full name.';
    if (!email.trim() || !email.includes('@')) errs.email = 'Please provide a valid email address.';
    if (!subject.trim()) errs.subject = 'Please specify an inquiry subject.';
    if (!message.trim() || message.length < 15)
      errs.message = 'Message must be at least 15 characters long.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    submitContactInquiry(name, email, subject, message);
    setSubmitted(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  const faqs = [
    {
      q: 'How quickly does the municipal sanitation team respond?',
      a: 'Urgent reports (hazardous chemical spills, toxic batteries, and blocked stormwater culverts) are reviewed within 2 hours. Standard overflow and litter complaints are swept within 24 to 48 hours.',
    },
    {
      q: 'Do I need an account to report a waste problem?',
      a: 'You can file a report quickly with basic contact info so our crew can reach you for clarification. Creating an account allows you to track real-time resolution and submit ratings.',
    },
    {
      q: 'Is my exact address or phone published publicly?',
      a: 'Never. Public Impact charts and the community feed only show the general district (e.g. "Sector 4") and ticket code. Your personal identifiable information is restricted to authorized municipal officers.',
    },
    {
      q: 'What should I do if a private property has severe waste build-up?',
      a: 'CleanConnect handles public rights-of-way, parks, and sidewalks. For private residential code enforcement, contact the Municipal Housing Inspection Bureau directly.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <span>Support & Helpdesk</span>
          <span aria-hidden="true">·</span>
          <span>Civic Operations Office</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          Contact CleanConnect & Sanitation Dispatch
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Need assistance filing a complaint, arranging community clean-up tool loans, or reporting
          an urgent environmental hazard? Reach out to our team below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Direct Contacts */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Civic Operations Centers
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    Municipal Sanitation Depot #2
                  </span>
                  <span className="text-slate-500">
                    400 Public Works Blvd, Sector 4 Environmental Center
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    Dispatch Hotline & Urgent Spill Desk
                  </span>
                  <span className="text-slate-500 font-mono">+1 (555) 321-CLEAN (2532)</span>
                  <span className="text-[11px] text-slate-400 block">
                    Available Mon–Sat: 06:00 – 20:00
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    General Inquiries & Community Partnerships
                  </span>
                  <span className="text-slate-500 font-mono">support@cleanconnect.org</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    E-Waste & Hazardous Dropoff Bay Hours
                  </span>
                  <span className="text-slate-500">
                    Monday to Friday: 08:00 – 17:00 · Saturday: 09:00 – 14:00
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Alert Box */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>For Immediate Chemical Emergencies:</span>
            </span>
            <p>
              If you witness active chemical dumping or gas line ruptures, please dial local
              emergency services (911 / 112) immediately prior to filing an application ticket.
            </p>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Submit a Civic Inquiry
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Have a question about waste routes, recycling rules, or school educational visits?
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Message Sent Successfully!
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Our community coordination team will respond within 1 business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Elena Rostova"
                      className={`w-full px-3.5 py-2 text-xs rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                        errors.name ? 'border-red-400' : 'border-slate-300 dark:border-slate-700'
                      }`}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="resident@cleanconnect.org"
                      className={`w-full px-3.5 py-2 text-xs rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                        errors.email ? 'border-red-400' : 'border-slate-300 dark:border-slate-700'
                      }`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Inquiring about organizing a neighborhood park cleanup"
                    className={`w-full px-3.5 py-2 text-xs rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                      errors.subject ? 'border-red-400' : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                  {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please include relevant location details or dates..."
                    className={`w-full px-3.5 py-2 text-xs rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                      errors.message ? 'border-red-400' : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                  {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
