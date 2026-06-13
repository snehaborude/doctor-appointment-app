import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API request
    setIsSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const faqs = [
    {
      q: "How do I book an appointment?",
      a: "Simply browse through our verified doctors, pick a specialization or select a doctor directly, choose a time slot that works for you, and click 'Book Appointment'. You will instantly receive a confirmation."
    },
    {
      q: "Are all doctors on DocReserv verified?",
      a: "Yes, absolutely. Every medical professional on our platform undergoes a rigorous credential verification process, checking their medical degrees, licensing boards, and practice history before being listed."
    },
    {
      q: "Can I cancel or reschedule my appointment?",
      a: "Yes. You can cancel or reschedule appointments directly from your Patient Dashboard up to 2 hours before the scheduled time slot."
    },
    {
      q: "Is my personal and medical data secure?",
      a: "Security is our top priority. We use industry-standard end-to-end encryption to secure your personal health records, scheduling history, and credentials."
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 text-white py-16 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Contact <span className="text-teal-200">Us</span></h1>
        <p className="text-teal-100 max-w-xl mx-auto text-lg">
          Have a question, feedback, or need help? Get in touch with the DocReserv support team.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Details Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Get In Touch</h2>
              <p className="text-gray-500 text-sm">We are here to assist you with any questions or support you might need.</p>
            </div>

            <div className="flex flex-col gap-5">
              {/* Phone */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Phone Support</h4>
                  <a href="tel:+919876543210" className="text-sm text-gray-500 hover:text-teal-600 transition-colors mt-0.5 block">
                    +91 98765 43210
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Email Support</h4>
                  <a href="mailto:support@docreserv.com" className="text-sm text-gray-500 hover:text-teal-600 transition-colors mt-0.5 block">
                    support@docreserv.com
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Our Location</h4>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                    123 Healthcare Ave, Medical District, Mumbai 400001
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Working Hours</h4>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Mon - Sat: 9:00 AM - 8:00 PM <br />
                    Sun: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm lg:col-span-2">
            {isSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Message Sent Successfully!</h3>
                <p className="text-gray-500 text-sm max-w-sm mb-6">
                  Thank you for reaching out. A support representative will review your inquiry and get back to you shortly.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors text-sm cursor-pointer border-0"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Send Us a Message</h2>
                  <p className="text-gray-500 text-sm">Fill out the form below and we will get back to you within 24 hours.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-600">Your Name</label>
                      <input
                        type="text" name="name" required
                        placeholder="John Doe"
                        value={formData.name} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-600">Email Address</label>
                      <input
                        type="email" name="email" required
                        placeholder="john@example.com"
                        value={formData.email} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Subject</label>
                    <input
                      type="text" name="subject" required
                      placeholder="How can we help you?"
                      value={formData.subject} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Message</label>
                    <textarea
                      name="message" required rows="4"
                      placeholder="Write your message details here..."
                      value={formData.message} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white resize-y focus:outline-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-fit px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 cursor-pointer border-0 mt-2 text-sm"
                  >
                    <span>Send Message</span>
                    <Send size={14} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* FAQs Section */}
        <div className="mt-16 bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-sm max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex justify-between items-center text-left py-2 font-semibold text-gray-800 hover:text-teal-600 transition-colors border-0 bg-transparent cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} className="text-teal-600" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </button>
                  {isOpen && (
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed transition-all pl-1">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
