import { useState } from 'react'
import { SignInModal } from '@/components/SignInModal'
import { SignUpModal } from '@/components/SignUpModal'

export function Landing() {
  const [signInOpen, setSignInOpen] = useState(false)
  const [signUpOpen, setSignUpOpen] = useState(false)

  return (
    <div className="min-h-screen bg-page">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-page/80 backdrop-blur-[12px]">
        <div className="max-w-[1200px] mx-auto px-[40px] py-[20px] flex items-center justify-between">
          <div className="flex items-center gap-[8px]">
            <img src="/warrantifylogo.png" alt="Warrantify" className="w-[28px] h-[28px] rounded-[6px]" />
            <p className="font-brand font-medium text-[18px] text-text-primary tracking-[-0.36px]">Warrantify</p>
          </div>
          <div className="flex items-center gap-[16px]">
            <a href="#features" className="font-medium text-[14px] text-text-secondary tracking-[-0.28px] hover:text-text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="font-medium text-[14px] text-text-secondary tracking-[-0.28px] hover:text-text-primary transition-colors">How it works</a>
            <a href="#pricing" className="font-medium text-[14px] text-text-secondary tracking-[-0.28px] hover:text-text-primary transition-colors">Pricing</a>
            <button
              onClick={() => setSignUpOpen(true)}
              className="px-[20px] py-[10px] rounded-[10px] border border-btn-primary text-btn-primary text-[14px] font-medium tracking-[-0.28px] hover:bg-btn-primary/5 transition-colors"
            >
              Register
            </button>
            <button
              onClick={() => setSignInOpen(true)}
              className="bg-btn-primary px-[20px] py-[10px] rounded-[10px] text-white text-[14px] font-medium tracking-[-0.28px] hover:opacity-90 transition-opacity"
            >
              Log in
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-[140px] pb-[80px] px-[40px]">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center text-center gap-[32px]">
          <h1 className="font-brand font-medium text-[56px] text-text-primary tracking-[-1.68px] leading-[1.1] max-w-[700px]">
            Never lose track of a warranty again
          </h1>

          <p className="font-medium text-[18px] text-text-secondary tracking-[-0.36px] leading-[1.6] max-w-[520px]">
            Warrantify keeps all your product warranties organized in one place. Get timely reminders before they expire and never miss a claim.
          </p>

          <div className="flex gap-[12px] items-center">
            <button
              onClick={() => setSignInOpen(true)}
              className="bg-btn-primary px-[28px] py-[14px] rounded-[12px] text-white text-[16px] font-medium tracking-[-0.32px] hover:opacity-90 transition-opacity"
            >
              Get started free
            </button>
            <a href="#how-it-works" className="px-[28px] py-[14px] rounded-[12px] text-text-secondary text-[16px] font-medium tracking-[-0.32px] hover:bg-panel transition-colors">
              See how it works
            </a>
          </div>

          {/* Hero Illustration */}
          <div className="w-full max-w-[960px] mt-[24px] relative">
            {/* Floating decorative elements */}
            <div className="absolute -top-[20px] -left-[30px] w-[60px] h-[60px] rounded-[14px] bg-[#cde9d9] rotate-12 opacity-60" />
            <div className="absolute -top-[10px] -right-[20px] w-[44px] h-[44px] rounded-full bg-[#ffd6d6] opacity-50" />
            <div className="absolute -bottom-[16px] left-[80px] w-[36px] h-[36px] rounded-[10px] bg-sidebar-active/30 -rotate-6" />

            <div className="bg-panel rounded-[20px] shadow-[0px_12px_60px_rgba(125,112,134,0.15)] p-[3px] relative overflow-hidden">
              {/* Top bar */}
              <div className="bg-[#faf9fb] rounded-t-[17px] px-[20px] py-[10px] flex items-center gap-[8px] border-b border-[#eee]">
                <div className="flex gap-[6px]">
                  <div className="w-[10px] h-[10px] rounded-full bg-[#e8e6ec]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#e8e6ec]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#e8e6ec]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-[#eee] rounded-[6px] px-[24px] py-[3px]">
                    <span className="font-medium text-[10px] text-text-muted tracking-[-0.2px]">warrantify.app</span>
                  </div>
                </div>
              </div>
              {/* App content */}
              <div className="flex">
                {/* Mini sidebar */}
                <div className="w-[160px] shrink-0 bg-panel px-[16px] py-[20px] flex flex-col gap-[16px] border-r border-inner-border">
                  <div className="flex items-center gap-[8px]">
                    <div className="w-[22px] h-[22px] rounded-full bg-btn-primary flex items-center justify-center">
                      <span className="text-[9px] font-medium text-white">S</span>
                    </div>
                    <span className="font-medium text-[12px] text-text-body tracking-[-0.24px]">Sanchari</span>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="ml-auto"><path d="M3 4L5 6L7 4" stroke="#9F8EAB" strokeWidth="1" strokeLinecap="round"/></svg>
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    {[
                      { label: 'Home', active: true },
                      { label: 'Mail reminders', active: false },
                      { label: 'Notifications', active: false },
                      { label: 'Settings', active: false },
                      { label: 'Shredder', active: false },
                    ].map((item) => (
                      <div key={item.label} className={`px-[8px] py-[5px] rounded-[6px] text-left ${item.active ? 'bg-sidebar-active' : ''}`}>
                        <span className={`font-medium text-[11px] tracking-[-0.22px] ${item.active ? 'text-white' : 'text-text-muted'}`}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Main area */}
                <div className="flex-1 bg-page p-[24px] flex flex-col gap-[16px] min-h-[280px]">
                  {/* Greeting */}
                  <p className="font-brand font-medium text-[16px] text-text-primary tracking-[-0.32px] text-center">Hello Sanchari!</p>
                  {/* Search bar */}
                  <div className="bg-panel rounded-[8px] px-[12px] py-[8px] flex items-center justify-between">
                    <span className="font-medium text-[11px] text-text-muted tracking-[-0.22px]">Add a new product...</span>
                    <div className="w-[20px] h-[20px] rounded-full bg-btn-primary flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 2V8M2 5H8" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    </div>
                  </div>
                  {/* Dashboard label + cards */}
                  <span className="font-medium text-[13px] text-text-primary tracking-[-0.26px] text-left">Dashboard</span>
                  <div className="flex gap-[8px]">
                    {[
                      { name: 'MacBook Pro 16"', brand: 'Apple', days: '30', status: 'Today', statusBg: 'bg-status-expiring-bg', statusText: 'text-status-expiring', img: '#d4c5db' },
                      { name: 'Washing Machine', brand: 'Samsung', days: '200', status: 'Active', statusBg: 'bg-status-active-bg', statusText: 'text-status-active', img: '#c5d4db' },
                      { name: 'OLED TV 55"', brand: 'LG', days: '540', status: 'Active', statusBg: 'bg-status-active-bg', statusText: 'text-status-active', img: '#dbd4c5' },
                      { name: 'Aeron Chair', brand: 'Herman Miller', days: '4,200', status: 'Active', statusBg: 'bg-status-active-bg', statusText: 'text-status-active', img: '#c5dbc8' },
                    ].map((card) => (
                      <div key={card.name} className="flex-1 bg-card-bg rounded-[8px] p-[6px] flex flex-col gap-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <div className="h-[46px] rounded-[5px]" style={{ backgroundColor: card.img }} />
                        <div className="flex flex-col gap-[6px] px-[3px] pb-[2px] text-left">
                          <div className="flex flex-col gap-[1px]">
                            <span className="font-medium text-[7px] text-text-brand tracking-[-0.14px]">{card.brand}</span>
                            <span className="font-medium text-[9px] text-text-body tracking-[-0.18px] truncate">{card.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[7px] text-text-body tracking-[-0.14px]">{card.days} days</span>
                            <span className={`px-[4px] py-[0.5px] rounded-[4px] text-[6px] font-medium leading-tight ${card.statusBg} ${card.statusText}`}>{card.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating notification badge */}
            <div className="absolute -right-[16px] top-[80px] bg-panel rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.1)] px-[14px] py-[10px] flex items-center gap-[8px] animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="w-[28px] h-[28px] rounded-[6px] bg-[#cde9d9] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7L5.5 9.5L11 4" stroke="#009f47" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-[10px] text-text-body tracking-[-0.2px]">Warranty saved!</span>
                <span className="font-medium text-[8px] text-text-muted tracking-[-0.16px]">MacBook Pro 16"</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos / Social proof */}
      <section className="py-[48px] px-[40px] border-t border-b border-inner-border">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-[24px]">
          <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px] uppercase">Manage warranties for products from</p>
          <div className="flex items-center gap-[48px] flex-wrap justify-center">
            {['Apple', 'Samsung', 'Sony', 'LG', 'Dyson', 'Bosch', 'IKEA', 'Philips'].map((brand) => (
              <span key={brand} className="font-brand font-medium text-[18px] text-[#c4c2c8] tracking-[-0.36px]">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-[100px] px-[40px]">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-[64px]">
          <div className="flex flex-col items-center text-center gap-[16px]">
            <p className="font-medium text-[13px] text-btn-primary tracking-[-0.26px] uppercase">Features</p>
            <h2 className="font-brand font-medium text-[40px] text-text-primary tracking-[-1.2px] leading-[1.15]">
              Everything you need to stay<br/>on top of your warranties
            </h2>
            <p className="font-medium text-[16px] text-text-secondary tracking-[-0.32px] max-w-[480px]">
              From tracking purchase dates to getting timely reminders, Warrantify has you covered.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-[20px]">
            <FeatureCard
              icon={<ShieldIcon />}
              title="Smart Tracking"
              description="Add products manually, scan receipts, or upload warranty cards. We organize everything automatically."
            />
            <FeatureCard
              icon={<BellIcon />}
              title="Timely Reminders"
              description="Get email alerts 30 days and 7 days before your warranty expires. Never miss a claim window."
            />
            <FeatureCard
              icon={<FolderIcon />}
              title="Document Storage"
              description="Attach receipts, warranty cards, and product images. Everything is securely stored and easily accessible."
            />
            <FeatureCard
              icon={<SearchIcon />}
              title="Instant Search"
              description="Find any product instantly by name, brand, category, or serial number across all your warranties."
            />
            <FeatureCard
              icon={<ChartIcon />}
              title="Dashboard Overview"
              description="See all your active and expired warranties at a glance with status badges and expiry countdowns."
            />
            <FeatureCard
              icon={<TrashIcon />}
              title="Safe Deletion"
              description="Deleted products go to the Shredder and stay recoverable for 30 days before permanent removal."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-[100px] px-[40px] bg-panel">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-[64px]">
          <div className="flex flex-col items-center text-center gap-[16px]">
            <p className="font-medium text-[13px] text-btn-primary tracking-[-0.26px] uppercase">How it works</p>
            <h2 className="font-brand font-medium text-[40px] text-text-primary tracking-[-1.2px] leading-[1.15]">
              Three steps to warranty peace of mind
            </h2>
          </div>

          <div className="flex gap-[32px]">
            <StepCard
              step="01"
              title="Add your products"
              description="Type a product name, fill in the details, and attach your receipt or warranty card. It takes less than a minute."
              illustration={<AddProductIllustration />}
            />
            <StepCard
              step="02"
              title="We'll remind you"
              description="Warrantify automatically sends email reminders 30 days and 7 days before each warranty expires."
              illustration={<ReminderIllustration />}
            />
            <StepCard
              step="03"
              title="Claim with confidence"
              description="When something goes wrong, pull up your warranty details, serial number, and documents instantly."
              illustration={<ClaimIllustration />}
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-[80px] px-[40px]">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-btn-primary rounded-[20px] px-[60px] py-[48px] flex items-center justify-between">
            {[
              { value: '10K+', label: 'Active users' },
              { value: '85K+', label: 'Warranties tracked' },
              { value: '$2.4M', label: 'Claims recovered' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-[4px] items-center">
                <p className="font-brand font-medium text-[36px] text-white tracking-[-1.08px]">{stat.value}</p>
                <p className="font-medium text-[14px] text-white/70 tracking-[-0.28px]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-[100px] px-[40px] bg-panel">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-[64px]">
          <div className="flex flex-col items-center text-center gap-[16px]">
            <p className="font-medium text-[13px] text-btn-primary tracking-[-0.26px] uppercase">Testimonials</p>
            <h2 className="font-brand font-medium text-[40px] text-text-primary tracking-[-1.2px] leading-[1.15]">
              Loved by thousands of users
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-[20px]">
            <TestimonialCard
              quote="Warrantify saved me $800 on my laptop repair. I had no idea the warranty was about to expire until I got the reminder."
              name="Alex M."
              role="Software Engineer"
            />
            <TestimonialCard
              quote="I manage warranties for all my home appliances here. The search and organization is brilliant. Highly recommended!"
              name="Priya S."
              role="Interior Designer"
            />
            <TestimonialCard
              quote="The document storage feature is a game changer. No more digging through drawers for receipts. Everything is in one place."
              name="Marcus T."
              role="Business Owner"
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-[100px] px-[40px]">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-[64px]">
          <div className="flex flex-col items-center text-center gap-[16px]">
            <p className="font-medium text-[13px] text-btn-primary tracking-[-0.26px] uppercase">Pricing</p>
            <h2 className="font-brand font-medium text-[40px] text-text-primary tracking-[-1.2px] leading-[1.15]">
              Simple, transparent pricing
            </h2>
            <p className="font-medium text-[16px] text-text-secondary tracking-[-0.32px]">
              Start free. Upgrade when you need more.
            </p>
          </div>

          <div className="flex gap-[20px] justify-center">
            <PricingCard
              plan="Free"
              price="$0"
              period="forever"
              description="Perfect for getting started"
              features={['Up to 10 products', 'Email reminders', 'Document uploads', 'Search & filter', '30-day Shredder']}
              onSignIn={() => setSignInOpen(true)}
            />
            <PricingCard
              plan="Pro"
              price="$5"
              period="/ month"
              description="For the warranty-conscious"
              features={['Unlimited products', 'Priority reminders', 'Unlimited storage', 'Export data as CSV', 'Family sharing (5 members)', 'Priority support']}
              highlighted
              onSignIn={() => setSignInOpen(true)}
            />
            <PricingCard
              plan="Business"
              price="$19"
              period="/ month"
              description="For teams and organizations"
              features={['Everything in Pro', 'Unlimited team members', 'Admin dashboard', 'API access', 'Custom integrations', 'Dedicated support']}
              onSignIn={() => setSignInOpen(true)}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[100px] px-[40px] bg-panel">
        <div className="max-w-[700px] mx-auto flex flex-col items-center text-center gap-[24px]">
          <h2 className="font-brand font-medium text-[40px] text-text-primary tracking-[-1.2px] leading-[1.15]">
            Start protecting your purchases today
          </h2>
          <p className="font-medium text-[16px] text-text-secondary tracking-[-0.32px] max-w-[440px]">
            Join thousands of smart consumers who never lose money on expired warranties.
          </p>
          <button
            onClick={() => setSignInOpen(true)}
            className="bg-btn-primary px-[32px] py-[14px] rounded-[12px] text-white text-[16px] font-medium tracking-[-0.32px] hover:opacity-90 transition-opacity"
          >
            Get started — it's free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-[48px] px-[40px] border-t border-inner-border">
        <div className="max-w-[1200px] mx-auto flex items-start justify-between">
          <div className="flex flex-col gap-[12px]">
            <div className="flex items-center gap-[8px]">
              <img src="/warrantifylogo.png" alt="Warrantify" className="w-[24px] h-[24px] rounded-[6px]" />
              <p className="font-brand font-medium text-[16px] text-text-primary tracking-[-0.32px]">Warrantify</p>
            </div>
            <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px] max-w-[280px]">
              The smartest way to track and manage your product warranties.
            </p>
          </div>

          <div className="flex gap-[60px]">
            <FooterColumn title="Product" links={['Features', 'Pricing', 'Changelog', 'Documentation']} />
            <FooterColumn title="Company" links={['About', 'Blog', 'Careers', 'Contact']} />
            <FooterColumn title="Legal" links={['Privacy', 'Terms', 'Security']} />
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-[40px] pt-[24px] border-t border-inner-border flex items-center justify-between">
          <p className="font-medium text-[12px] text-text-muted tracking-[-0.24px]">2026 Warrantify. All rights reserved.</p>
          <div className="flex gap-[16px]">
            <SocialIcon type="twitter" />
            <SocialIcon type="github" />
            <SocialIcon type="linkedin" />
          </div>
        </div>
      </footer>

      <SignInModal open={signInOpen} onOpenChange={setSignInOpen} />
      <SignUpModal open={signUpOpen} onOpenChange={setSignUpOpen} />
    </div>
  )
}

/* ── Feature Card ───────────────────────────────────────── */

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-panel rounded-[16px] p-[28px] flex flex-col gap-[16px] hover:shadow-[0px_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
      <div className="w-[44px] h-[44px] rounded-[10px] bg-[#f0edf3] flex items-center justify-center text-btn-primary">
        {icon}
      </div>
      <p className="font-medium text-[18px] text-text-primary tracking-[-0.36px]">{title}</p>
      <p className="font-medium text-[14px] text-text-secondary tracking-[-0.28px] leading-[1.6]">{description}</p>
    </div>
  )
}

/* ── Step Card ──────────────────────────────────────────── */

function StepCard({ step, title, description, illustration }: { step: string; title: string; description: string; illustration: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col gap-[20px]">
      <div className="bg-page rounded-[16px] p-[20px] h-[240px] flex items-center justify-center overflow-hidden">
        {illustration}
      </div>
      <div className="flex flex-col gap-[8px]">
        <p className="font-medium text-[13px] text-btn-primary tracking-[-0.26px]">Step {step}</p>
        <p className="font-medium text-[18px] text-text-primary tracking-[-0.36px]">{title}</p>
        <p className="font-medium text-[14px] text-text-secondary tracking-[-0.28px] leading-[1.6]">{description}</p>
      </div>
    </div>
  )
}

/* ── Testimonial Card ───────────────────────────────────── */

function TestimonialCard({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <div className="bg-page rounded-[16px] p-[28px] flex flex-col gap-[20px]">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M10 8H6C4.89543 8 4 8.89543 4 10V14C4 15.1046 4.89543 16 6 16H8L6 20H8.5L10.5 16H10C11.1046 16 12 15.1046 12 14V10C12 8.89543 11.1046 8 10 8Z" fill="#d4d2de"/>
        <path d="M20 8H16C14.8954 8 14 8.89543 14 10V14C14 15.1046 14.8954 16 16 16H18L16 20H18.5L20.5 16H20C21.1046 16 22 15.1046 22 14V10C22 8.89543 21.1046 8 20 8Z" fill="#d4d2de"/>
      </svg>
      <p className="font-medium text-[15px] text-text-body tracking-[-0.3px] leading-[1.6] flex-1">{quote}</p>
      <div className="flex items-center gap-[10px]">
        <div className="w-[32px] h-[32px] rounded-full bg-btn-primary flex items-center justify-center">
          <span className="text-[12px] font-medium text-white">{name[0]}</span>
        </div>
        <div>
          <p className="font-medium text-[14px] text-text-primary tracking-[-0.28px]">{name}</p>
          <p className="font-medium text-[12px] text-text-muted tracking-[-0.24px]">{role}</p>
        </div>
      </div>
    </div>
  )
}

/* ── Pricing Card ───────────────────────────────────────── */

function PricingCard({ plan, price, period, description, features, highlighted, onSignIn }: {
  plan: string; price: string; period: string; description: string; features: string[]; highlighted?: boolean; onSignIn: () => void
}) {
  return (
    <div className={`w-[340px] rounded-[16px] p-[32px] flex flex-col gap-[24px] ${
      highlighted
        ? 'bg-btn-primary text-white ring-4 ring-btn-primary/20'
        : 'bg-panel'
    }`}>
      <div className="flex flex-col gap-[8px]">
        <div className="flex items-center gap-[8px]">
          <p className={`font-medium text-[16px] tracking-[-0.32px] ${highlighted ? 'text-white/80' : 'text-text-secondary'}`}>{plan}</p>
          {highlighted && (
            <span className="bg-white/20 px-[8px] py-[2px] rounded-full text-[11px] font-medium tracking-[-0.22px]">Popular</span>
          )}
        </div>
        <div className="flex items-baseline gap-[4px]">
          <p className={`font-brand font-medium text-[40px] tracking-[-1.2px] ${highlighted ? 'text-white' : 'text-text-primary'}`}>{price}</p>
          <p className={`font-medium text-[14px] tracking-[-0.28px] ${highlighted ? 'text-white/60' : 'text-text-muted'}`}>{period}</p>
        </div>
        <p className={`font-medium text-[14px] tracking-[-0.28px] ${highlighted ? 'text-white/70' : 'text-text-secondary'}`}>{description}</p>
      </div>

      <button
        onClick={onSignIn}
        className={`w-full py-[12px] rounded-[10px] text-[15px] font-medium tracking-[-0.3px] transition-opacity hover:opacity-90 ${
          highlighted
            ? 'bg-white text-btn-primary'
            : 'bg-btn-primary text-white'
        }`}
      >
        Get started
      </button>

      <div className="flex flex-col gap-[10px]">
        {features.map((f) => (
          <div key={f} className="flex items-center gap-[8px]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L6.5 11.5L13 4.5" stroke={highlighted ? 'white' : '#009f47'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className={`font-medium text-[13px] tracking-[-0.26px] ${highlighted ? 'text-white/90' : 'text-text-secondary'}`}>{f}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Footer ─────────────────────────────────────────────── */

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="flex flex-col gap-[12px]">
      <p className="font-medium text-[13px] text-text-primary tracking-[-0.26px]">{title}</p>
      {links.map((link) => (
        <button key={link} className="text-left font-medium text-[13px] text-text-muted tracking-[-0.26px] hover:text-text-secondary transition-colors">
          {link}
        </button>
      ))}
    </div>
  )
}

function SocialIcon({ type }: { type: 'twitter' | 'github' | 'linkedin' }) {
  const paths = {
    twitter: <path d="M4 4L10 12L4 20H6L11 14L15 20H20L14 12L20 4H18L13 10L9 4H4Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>,
    github: <><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.2"/><path d="M9 20C9 16 7 15 7 12C7 9 9 7 12 7C15 7 17 9 17 12C17 15 15 16 15 20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>,
    linkedin: <><rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.2"/><path d="M8 11V16M12 16V13C12 11.5 13 11 14 11C15 11 16 11.5 16 13V16M8 8.5V8.51" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>,
  }
  return (
    <button className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-inner transition-colors">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">{paths[type]}</svg>
    </button>
  )
}

/* ── Inline SVG Icons ───────────────────────────────────── */

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2L3 6V11C3 15.97 6.42 20.61 11 21.5C15.58 20.61 19 15.97 19 11V6L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M7.5 11L10 13.5L14.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 3C8.24 3 6 5.24 6 8V12L4 15H18L16 12V8C16 5.24 13.76 3 11 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 17C9 18.1 9.9 19 11 19C12.1 19 13 18.1 13 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 6C3 4.9 3.9 4 5 4H9L11 6H17C18.1 6 19 6.9 19 8V16C19 17.1 18.1 18 17 18H5C3.9 18 3 17.1 3 16V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 13L10 15L14 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M14.5 14.5L19 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="3" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 14V11M11 14V8M15 14V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M4 7H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6 7V17C6 18.1 6.9 19 8 19H14C15.1 19 16 18.1 16 17V7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 4H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 11V15M13 11V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

/* ── Step Illustrations ─────────────────────────────────── */

function AddProductIllustration() {
  return (
    <div className="relative w-[260px] h-[200px]">
      {/* Background decorative shapes */}
      <div className="absolute top-[2px] left-[6px] w-[40px] h-[40px] rounded-[10px] bg-[#cde9d9] rotate-12 opacity-50" />
      <div className="absolute bottom-[20px] right-[8px] w-[32px] h-[32px] rounded-full bg-[#ffd6d6] opacity-40" />

      {/* Main form card */}
      <div className="absolute top-[12px] left-[20px] right-[20px] bg-panel rounded-[12px] shadow-[0_4px_24px_rgba(125,112,134,0.12)] p-[16px] flex flex-col gap-[10px]">
        {/* Title */}
        <div className="flex items-center gap-[6px]">
          <div className="w-[16px] h-[16px] rounded-[4px] bg-btn-primary flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M4 1V7M1 4H7" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </div>
          <span className="font-medium text-[10px] text-text-body tracking-[-0.2px]">Add new product</span>
        </div>
        {/* Product name input */}
        <div className="bg-[#f8f7fa] rounded-[6px] px-[10px] py-[7px]">
          <span className="font-medium text-[8px] text-text-muted tracking-[-0.16px]">Product name</span>
          <div className="mt-[3px] h-[3px] w-[70%] bg-[#d4d2de] rounded-full" />
        </div>
        {/* Two column inputs */}
        <div className="flex gap-[8px]">
          <div className="flex-1 bg-[#f8f7fa] rounded-[6px] px-[10px] py-[7px]">
            <span className="font-medium text-[8px] text-text-muted tracking-[-0.16px]">Brand</span>
            <div className="mt-[3px] h-[3px] w-[60%] bg-[#d4d2de] rounded-full" />
          </div>
          <div className="flex-1 bg-[#f8f7fa] rounded-[6px] px-[10px] py-[7px]">
            <span className="font-medium text-[8px] text-text-muted tracking-[-0.16px]">Category</span>
            <div className="mt-[3px] h-[3px] w-[50%] bg-[#d4d2de] rounded-full" />
          </div>
        </div>
        {/* Image upload area */}
        <div className="border border-dashed border-[#d4d2de] rounded-[6px] px-[10px] py-[8px] flex items-center gap-[8px]">
          <div className="w-[22px] h-[22px] rounded-[4px] bg-[#f0edf3] flex items-center justify-center shrink-0">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 7L3.5 4.5L5 6L7 3.5L9 7" stroke="#9F8EAB" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="3" cy="3" r="1" stroke="#9F8EAB" strokeWidth="0.8"/></svg>
          </div>
          <span className="font-medium text-[8px] text-text-muted tracking-[-0.16px]">Upload receipt or image</span>
        </div>
        {/* Save button */}
        <div className="flex justify-end">
          <div className="bg-btn-primary rounded-[6px] px-[14px] py-[5px]">
            <span className="font-medium text-[8px] text-white tracking-[-0.16px]">Save product</span>
          </div>
        </div>
      </div>

      {/* Floating success toast */}
      <div className="absolute bottom-[4px] left-[28px] bg-panel rounded-[8px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] px-[10px] py-[6px] flex items-center gap-[6px]">
        <div className="w-[16px] h-[16px] rounded-full bg-[#cde9d9] flex items-center justify-center shrink-0">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2" stroke="#009f47" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <span className="font-medium text-[8px] text-text-body tracking-[-0.16px]">Product added!</span>
      </div>
    </div>
  )
}

function ReminderIllustration() {
  return (
    <div className="relative w-[260px] h-[200px]">
      {/* Background decorative shapes */}
      <div className="absolute top-[4px] right-[12px] w-[36px] h-[36px] rounded-[10px] bg-[#ffd6d6] -rotate-6 opacity-50" />
      <div className="absolute bottom-[18px] left-[10px] w-[28px] h-[28px] rounded-full bg-sidebar-active/25" />

      {/* Main email card */}
      <div className="absolute top-[16px] left-[16px] right-[16px] bg-panel rounded-[12px] shadow-[0_4px_24px_rgba(125,112,134,0.12)] p-[16px] flex flex-col gap-[10px]">
        {/* Email header */}
        <div className="flex items-center gap-[8px]">
          <div className="w-[20px] h-[20px] rounded-full bg-btn-primary flex items-center justify-center shrink-0">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="2.5" width="8" height="5" rx="1" stroke="white" strokeWidth="0.8"/><path d="M1.5 3L5 5.5L8.5 3" stroke="white" strokeWidth="0.8" strokeLinecap="round"/></svg>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-[9px] text-text-body tracking-[-0.18px]">Warranty Reminder</span>
            <span className="font-medium text-[7px] text-text-muted tracking-[-0.14px]">from Warrantify</span>
          </div>
          <div className="ml-auto px-[5px] py-[1px] rounded-full bg-[#ffd6d6] shrink-0">
            <span className="font-medium text-[6px] text-status-expiring tracking-[-0.12px] leading-tight">7 days left</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-[#f0ede8]" />

        {/* Email body */}
        <div className="flex flex-col gap-[5px]">
          <span className="font-medium text-[9px] text-text-body tracking-[-0.18px]">Your MacBook Pro warranty expires soon</span>
          <div className="h-[3px] w-[90%] bg-[#f0ede8] rounded-full" />
          <div className="h-[3px] w-[70%] bg-[#f4f4f4] rounded-full" />
        </div>

        {/* Product preview card */}
        <div className="flex items-center gap-[8px] bg-[#f8f7fa] rounded-[8px] p-[8px]">
          <div className="w-[28px] h-[28px] rounded-[6px] bg-[#d4c5db] shrink-0" />
          <div className="flex flex-col gap-[1px] min-w-0">
            <span className="font-medium text-[7px] text-text-brand tracking-[-0.14px]">Apple</span>
            <span className="font-medium text-[9px] text-text-body tracking-[-0.18px]">MacBook Pro 16"</span>
          </div>
          <div className="ml-auto shrink-0">
            <span className="font-medium text-[7px] text-status-expiring tracking-[-0.14px]">Expires Apr 2</span>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-btn-primary rounded-[6px] py-[5px] flex items-center justify-center">
          <span className="font-medium text-[8px] text-white tracking-[-0.16px]">View warranty details</span>
        </div>
      </div>

      {/* Floating bell badge */}
      <div className="absolute top-[2px] right-[6px] w-[30px] h-[30px] rounded-[8px] bg-btn-primary shadow-[0_2px_10px_rgba(125,112,134,0.3)] flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2C5 2 3.5 3.5 3.5 5.5V8L2.5 9.5H11.5L10.5 8V5.5C10.5 3.5 9 2 7 2Z" stroke="white" strokeWidth="1" strokeLinejoin="round"/>
          <path d="M5.5 10.5C5.5 11.3 6.2 12 7 12C7.8 12 8.5 11.3 8.5 10.5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
        </svg>
        <div className="absolute -top-[3px] -right-[3px] w-[8px] h-[8px] rounded-full bg-status-expiring border-[1.5px] border-white" />
      </div>
    </div>
  )
}

function ClaimIllustration() {
  return (
    <div className="relative w-[260px] h-[200px]">
      {/* Background decorative shapes */}
      <div className="absolute top-[4px] right-[14px] w-[34px] h-[34px] rounded-[10px] bg-[#cde9d9] rotate-6 opacity-50" />
      <div className="absolute bottom-[20px] left-[12px] w-[26px] h-[26px] rounded-full bg-[#ffd6d6] opacity-40" />

      {/* Main warranty document card */}
      <div className="absolute top-[12px] left-[18px] right-[18px] bg-panel rounded-[12px] shadow-[0_4px_24px_rgba(125,112,134,0.12)] p-[16px] flex flex-col gap-[10px]">
        {/* Header with shield */}
        <div className="flex items-center gap-[8px]">
          <div className="w-[20px] h-[20px] rounded-[4px] bg-[#cde9d9] flex items-center justify-center shrink-0">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1L2 2.5V5C2 7.2 3.3 9 5 9.5C6.7 9 8 7.2 8 5V2.5L5 1Z" stroke="#009f47" strokeWidth="0.8" strokeLinejoin="round"/>
              <path d="M3.5 5L4.5 6L6.5 4" stroke="#009f47" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-medium text-[9px] text-text-body tracking-[-0.18px]">Warranty Details</span>
          <div className="ml-auto px-[5px] py-[1px] rounded-full bg-status-active-bg shrink-0">
            <span className="font-medium text-[6px] text-status-active tracking-[-0.12px] leading-tight">Covered</span>
          </div>
        </div>

        {/* Product info */}
        <div className="flex items-center gap-[8px] bg-[#f8f7fa] rounded-[8px] p-[8px]">
          <div className="w-[28px] h-[28px] rounded-[6px] bg-[#c5d4db] shrink-0" />
          <div className="flex flex-col gap-[1px] min-w-0">
            <span className="font-medium text-[7px] text-text-brand tracking-[-0.14px]">Samsung</span>
            <span className="font-medium text-[9px] text-text-body tracking-[-0.18px]">Washing Machine</span>
          </div>
        </div>

        {/* Info rows */}
        <div className="flex flex-col gap-[6px]">
          <div className="flex justify-between">
            <span className="font-medium text-[7px] text-text-muted tracking-[-0.14px]">Serial Number</span>
            <span className="font-medium text-[7px] text-text-body tracking-[-0.14px]">WM-2024-X892</span>
          </div>
          <div className="h-[0.5px] bg-[#f0ede8]" />
          <div className="flex justify-between">
            <span className="font-medium text-[7px] text-text-muted tracking-[-0.14px]">Purchase Date</span>
            <span className="font-medium text-[7px] text-text-body tracking-[-0.14px]">Jan 15, 2025</span>
          </div>
          <div className="h-[0.5px] bg-[#f0ede8]" />
          <div className="flex justify-between">
            <span className="font-medium text-[7px] text-text-muted tracking-[-0.14px]">Expires</span>
            <span className="font-medium text-[7px] text-status-active tracking-[-0.14px]">Jan 15, 2027</span>
          </div>
        </div>

        {/* Attached documents */}
        <div className="flex gap-[6px]">
          <div className="flex items-center gap-[4px] bg-[#f0edf3] rounded-[4px] px-[6px] py-[4px]">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><rect x="1" y="0.5" width="6" height="7" rx="1" stroke="#7d7086" strokeWidth="0.6"/><path d="M2.5 2.5H5.5M2.5 3.8H4.5M2.5 5H5.5" stroke="#7d7086" strokeWidth="0.4" strokeLinecap="round"/></svg>
            <span className="font-medium text-[7px] text-[#7d7086] tracking-[-0.14px]">Receipt.pdf</span>
          </div>
          <div className="flex items-center gap-[4px] bg-[#f0edf3] rounded-[4px] px-[6px] py-[4px]">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><rect x="0.5" y="0.5" width="7" height="7" rx="1" stroke="#7d7086" strokeWidth="0.6"/><path d="M0.5 5.5L2.5 3.5L4 4.5L5.5 3L7.5 5.5" stroke="#7d7086" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="font-medium text-[7px] text-[#7d7086] tracking-[-0.14px]">Photo.jpg</span>
          </div>
        </div>
      </div>

      {/* Floating shield badge */}
      <div className="absolute bottom-[8px] right-[12px] w-[32px] h-[32px] rounded-[8px] bg-[#cde9d9] shadow-[0_2px_10px_rgba(0,159,71,0.2)] flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L3 4.5V8C3 11.3 5.15 14.2 8 15C10.85 14.2 13 11.3 13 8V4.5L8 2Z" stroke="#009f47" strokeWidth="1" strokeLinejoin="round"/>
          <path d="M5.5 8L7 9.5L10.5 6" stroke="#009f47" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  )
}
