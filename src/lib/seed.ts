// The generic demo workspace: Jua Coffee Co., a fictional Nairobi roaster.
// Every person, partner, email and phone number here is invented. Emails use
// example.com and phones use the 0700 000 xxx placeholder range so nothing in
// the demo can be mistaken for a real contact. Dates are generated relative to
// "today" so the dashboard always looks alive.

import type { Workspace } from "./types";
import { seedJuryCases } from "./juryCases";

const DAY = 86_400_000;

function iso(offsetDays: number, from = new Date()): string {
  const d = new Date(from.getTime() + offsetDays * DAY);
  return d.toISOString().slice(0, 10);
}

function at(offsetDays: number, hour: number): string {
  const d = new Date(Date.now() + offsetDays * DAY);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function month(offset: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 7);
}

function monthFraction(): number {
  const d = new Date();
  const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return Math.max(d.getDate() / days, 0.1);
}

export const WORKSPACE_VERSION = 3;

export function seedWorkspace(): Workspace {
  return {
    version: WORKSPACE_VERSION,
    profile: {
      name: "Jua Coffee Co.",
      tagline: "Kenyan coffee, roasted in Nairobi, poured with care.",
      industry: "Specialty coffee: roastery, cafés, office coffee and barista training",
      location: "Nairobi, Kenya",
      currency: "KES",
      website: "https://jua-coffee.example.com",
      demo: true,
      sectors: ["Hospitality", "Corporate offices", "Retail & e-commerce", "Training & skills", "Events"],
      offerings: [
        { id: "off-beans", name: "Single-origin beans (250g)", kind: "product", price: 1450, description: "Nyeri and Kirinyaga single origins, roasted weekly.", customers: 1840, rating: 4.8, repeatRate: 0.46, revenue: 2_668_000 },
        { id: "off-sub", name: "Jua Monthly subscription", kind: "subscription", price: 2600, description: "Two fresh bags delivered every month across Nairobi.", customers: 312, rating: 4.7, repeatRate: 0.81, revenue: 811_200 },
        { id: "off-office", name: "Office Coffee Service", kind: "service", price: 38000, description: "Machine, beans, servicing and barista visits for offices of 20 to 200.", customers: 27, rating: 4.6, repeatRate: 0.89, revenue: 1_026_000 },
        { id: "off-events", name: "Coffee bar for events", kind: "service", price: 65000, description: "A mobile espresso bar with two baristas for conferences and weddings.", customers: 41, rating: 4.9, repeatRate: 0.34, revenue: 2_665_000 },
        { id: "off-course", name: "Barista Foundations (3 days)", kind: "course", price: 18500, description: "Espresso, milk, hygiene and service. Certificate on completion.", customers: 96, rating: 4.8, repeatRate: 0.93, revenue: 1_776_000 },
        { id: "off-wholesale", name: "Wholesale for hotels & restaurants (5kg)", kind: "product", price: 19000, description: "House espresso blend with free machine calibration.", customers: 19, rating: 4.5, repeatRate: 0.78, revenue: 3_610_000 },
      ],
      partners: [
        { id: "p1", name: "Riverside Boutique Hotel", sector: "Hospitality", contact: "Grace Wanjiru", email: "grace@riverside-hotel.example.com", phone: "+254 700 000 101", social: "@riversidehotel_demo", website: "https://riverside-hotel.example.com", relationship: "Wholesale client since 2025" },
        { id: "p2", name: "Upper Hill Co-Working", sector: "Corporate offices", contact: "Brian Otieno", email: "brian@upperhill-cowork.example.com", phone: "+254 700 000 102", social: "@upperhillcowork_demo", website: "https://upperhill-cowork.example.com", relationship: "Office Coffee Service, 120 members" },
        { id: "p3", name: "Karura Weekend Market", sector: "Events", contact: "Amina Hassan", email: "amina@karura-market.example.com", phone: "+254 700 000 103", social: "@karuramarket_demo", website: "https://karura-market.example.com", relationship: "Monthly stall partner" },
        { id: "p4", name: "Savannah Culinary School", sector: "Training & skills", contact: "Peter Mwangi", email: "peter@savannah-culinary.example.com", phone: "+254 700 000 104", social: "@savannahculinary_demo", website: "https://savannah-culinary.example.com", relationship: "Co-delivers Barista Foundations" },
      ],
      keyDates: [
        { id: "k1", name: "Mashujaa Day", date: "2026-10-20", kind: "holiday", note: "Public holiday. Long-weekend café traffic." },
        { id: "k2", name: "Corporate gifting season opens", date: iso(14), kind: "season", note: "Offices plan year-end hampers. Push gift boxes." },
        { id: "k3", name: "Barista Foundations, November cohort", date: iso(24), kind: "launch", note: "16 seats. Registration closes 5 days before." },
        { id: "k4", name: "Black Friday", date: "2026-11-27", kind: "event", note: "Subscription first-month offer." },
        { id: "k5", name: "Jamhuri Day", date: "2026-12-12", kind: "holiday", note: "Public holiday." },
        { id: "k6", name: "Harvest cupping night", date: iso(31), kind: "event", note: "Invite-only tasting of the new crop for wholesale buyers." },
      ],
      brand: {
        voice: "Warm, proud of Kenyan coffee, quietly expert. Short sentences. We explain without lecturing and never sound like a chain.",
        pillars: ["From farm to cup", "The craft", "Coffee at work", "Our people"],
        doSay: ["name the farm and region", "use real numbers", "invite people in"],
        dontSay: ["'best coffee in Africa' or other unprovable superlatives", "health claims", "slang that excludes"],
        palette: { primary: "#3D7BFF", accent: "#22E6D3", aiFrom: "#8B5CF6", aiTo: "#EC4899" },
      },
      compliance: {
        regime: "Kenya Data Protection Act, 2019",
        regulator: "Office of the Data Protection Commissioner (ODPC)",
        notes: "Marketing messages need prior consent and an easy opt-out. Notify the ODPC within 72 hours of a breach.",
      },
    },

    calendar: [
      entry("c1", 1, "Corporate offices", "LinkedIn carousel", "LinkedIn", "What 120 people drinking better coffee does to a co-working floor", "Upper Hill Co-Working", "p2", "off-office", "Generate 6 Office Coffee demo requests", "Demo requests", "Office and facilities managers", "Coffee at work", "scheduled", "Office Coffee Q4"),
      entry("c2", 2, "Retail & e-commerce", "Reel", "Instagram", "Nyeri to Nairobi in 30 seconds: one bag's journey", "", "", "off-beans", "Drive bean sales on the web shop", "Add-to-carts", "Home brewers 25-40", "From farm to cup", "drafting", "Harvest story"),
      entry("c3", 3, "Hospitality", "Case study blog", "Blog", "How Riverside Boutique Hotel cut breakfast coffee waste by a third", "Riverside Boutique Hotel", "p1", "off-wholesale", "Rank for 'hotel coffee supplier Nairobi'", "Organic sessions", "Hotel F&B managers", "The craft", "in review", "Wholesale push"),
      entry("c4", 5, "Training & skills", "WhatsApp broadcast", "WhatsApp", "Last 9 seats: Barista Foundations November cohort", "Savannah Culinary School", "p4", "off-course", "Fill the November cohort", "Registrations", "Café staff and career changers", "Our people", "idea", "Barista cohort Nov"),
      entry("c5", 6, "Events", "Story series", "Instagram", "Behind the bar at Karura Weekend Market", "Karura Weekend Market", "p3", "off-events", "Build event-bar enquiries", "Enquiry DMs", "Event planners and couples", "Our people", "idea", ""),
      entry("c6", 8, "Corporate offices", "Email newsletter", "Email", "Year-end gift boxes for teams of 10 to 500", "", "", "off-beans", "Open corporate gifting season", "Gift box orders", "HR and admin leads", "Coffee at work", "drafting", "Corporate gifting"),
      entry("c7", 10, "Retail & e-commerce", "TikTok tutorial", "TikTok", "Three mistakes making your home coffee bitter", "", "", "off-sub", "Grow subscription trials", "Trial sign-ups", "Home brewers 20-35", "The craft", "idea", "Subscription growth"),
      entry("c8", 13, "Hospitality", "LinkedIn post", "LinkedIn", "The calibration visit: why your espresso tastes different every week", "", "", "off-wholesale", "Book calibration visits", "Visits booked", "Restaurant owners", "The craft", "idea", "Wholesale push"),
      entry("c9", 17, "Training & skills", "Testimonial video", "YouTube", "From waiter to head barista in six months: Mercy's story", "Savannah Culinary School", "p4", "off-course", "Build course trust", "Course page visits", "Career changers", "Our people", "idea", "Barista cohort Nov"),
      entry("c10", 21, "Events", "Google Business post", "Google Business", "Booking now: coffee bars for December events", "", "", "off-events", "Capture December event demand", "Calls from profile", "Local searchers", "Our people", "idea", ""),
    ],

    campaigns: [
      { id: "cmp1", name: "Office Coffee: Upper Hill & Westlands", platform: "LinkedIn", status: "active", objective: "Lead generation", audience: "Facilities and office managers, Nairobi, 50+ staff", offering: "off-office", budget: 60000, spent: 41200, impressions: 58300, clicks: 612, conversions: 6, revenue: 228000, startDate: iso(-24), endDate: iso(20) },
      { id: "cmp2", name: "Jua Monthly: first bag half price", platform: "Meta", status: "active", objective: "Conversions", audience: "Coffee interest, 22-45, Nairobi & Kiambu", offering: "off-sub", budget: 45000, spent: 30900, impressions: 241000, clicks: 3920, conversions: 88, revenue: 228800, startDate: iso(-18), endDate: iso(12) },
      { id: "cmp3", name: "Wholesale search: hotel coffee supplier", platform: "Google", status: "active", objective: "Calls & form fills", audience: "Search: coffee supplier, hotel coffee, espresso beans wholesale", offering: "off-wholesale", budget: 35000, spent: 22400, impressions: 9800, clicks: 486, conversions: 8, revenue: 152000, startDate: iso(-30), endDate: iso(30) },
      { id: "cmp4", name: "Retargeting: web shop visitors", platform: "Display", status: "paused", objective: "Sales", audience: "Visited shop in last 14 days, no purchase", offering: "off-beans", budget: 15000, spent: 11800, impressions: 132000, clicks: 640, conversions: 21, revenue: 30450, startDate: iso(-40), endDate: iso(-5) },
      { id: "cmp5", name: "Barista Foundations: November cohort", platform: "TikTok", status: "draft", objective: "Registrations", audience: "18-30, hospitality interest, Nairobi", offering: "off-course", budget: 25000, spent: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0, startDate: iso(2), endDate: iso(19) },
    ],

    leads: [
      lead("l1", "Joyce Njeri", "Kilimani Law Partners", "Office Administrator", "LinkedIn ad", "qualified", 82, 456000, -1, "Wants a trial week for 45 staff.", true),
      lead("l2", "Daniel Kiprop", "Westlands Fintech Hub", "Facilities Lead", "Website form", "proposal", 88, 912000, -2, "Proposal sent for two floors. Decision by month end.", true),
      lead("l3", "Faith Achieng", "Lavington Bistro", "Owner", "Google search", "contacted", 64, 228000, -3, "Asked for a calibration visit.", true),
      lead("l4", "Samuel Mutua", "Hilltop Conference Centre", "Events Manager", "Referral", "qualified", 76, 390000, -4, "Three December conferences.", true),
      lead("l5", "Wanjiku Kamau", "Bloom Wedding Planners", "Lead Planner", "Instagram DM", "new", 55, 130000, 0, "Asked about weekend availability.", true),
      lead("l6", "Ahmed Ali", "Coastline Catering", "Operations Manager", "Event (Karura)", "new", 48, 228000, -1, "Met at the market stall.", false),
      lead("l7", "Lucy Wairimu", "Parklands Medical Plaza", "Admin Manager", "LinkedIn ad", "contacted", 61, 456000, -11, "Interested but waiting on Q1 budget.", true),
      lead("l8", "Kevin Odhiambo", "Riverside Boutique Hotel", "F&B Manager", "Existing client", "won", 95, 684000, -9, "Renewed wholesale for 12 months.", true),
      lead("l9", "Mercy Chebet", "Self", "Career changer", "TikTok", "qualified", 70, 18500, -2, "Wants the November barista cohort.", true),
      lead("l10", "John Kariuki", "Gigiri Embassy Staff Club", "Club Secretary", "Website form", "new", 58, 304000, 0, "Monthly socials, 80 people.", true),
      lead("l11", "Esther Moraa", "Two Rivers Retail Office", "HR Officer", "Email newsletter", "contacted", 52, 95000, -9, "Year-end gift boxes for 60 staff.", true),
      lead("l12", "Patrick Ndungu", "Ngong Road Guesthouse", "Manager", "Google search", "lost", 30, 114000, -20, "Chose a cheaper supplier.", true),
    ],

    emails: [
      { id: "e1", name: "October: new harvest is here", kind: "broadcast", status: "sent", audience: "All subscribers (opted in)", subject: "The new Nyeri harvest just landed", body: "", steps: [], scheduledFor: iso(-6), sent: 4820, opens: 2121, clicks: 386 },
      { id: "e2", name: "Corporate gift boxes", kind: "broadcast", status: "scheduled", audience: "Corporate contacts (opted in)", subject: "Year-end gifts your team will actually use", body: "", steps: [], scheduledFor: iso(8), sent: 0, opens: 0, clicks: 0 },
      { id: "e3", name: "Barista cohort reminder", kind: "broadcast", status: "draft", audience: "Course enquiries", subject: "9 seats left for November", body: "", steps: [], scheduledFor: "", sent: 0, opens: 0, clicks: 0 },
      { id: "e4", name: "Welcome: new subscribers", kind: "automation", status: "running", audience: "New Jua Monthly subscribers", subject: "Welcome to Jua Monthly", body: "", steps: [
        { delayDays: 0, subject: "Welcome to Jua Monthly", body: "Your first bags ship this week." },
        { delayDays: 3, subject: "How to brew your first bag", body: "A two-minute guide." },
        { delayDays: 10, subject: "Meet the farm behind your coffee", body: "Nyeri, 1,800m." },
      ], scheduledFor: "", sent: 1260, opens: 788, clicks: 241 },
      { id: "e5", name: "Office enquiry follow-up", kind: "automation", status: "running", audience: "Office Coffee enquiries", subject: "Your Jua office trial", body: "", steps: [
        { delayDays: 0, subject: "Your Jua office trial", body: "Here's how the free week works." },
        { delayDays: 2, subject: "What other offices say", body: "Three short stories." },
        { delayDays: 6, subject: "Shall we book your trial week?", body: "Pick a date." },
      ], scheduledFor: "", sent: 214, opens: 141, clicks: 52 },
      { id: "e6", name: "Win-back: lapsed subscribers", kind: "automation", status: "paused", audience: "Cancelled in last 90 days", subject: "We roasted something new", body: "", steps: [
        { delayDays: 0, subject: "We roasted something new", body: "A limited Kirinyaga lot." },
        { delayDays: 7, subject: "Your first month back is on us", body: "Offer ends Sunday." },
      ], scheduledFor: "", sent: 380, opens: 118, clicks: 19 },
    ],

    library: [
      asset("a1", "Brand guidelines 2026", "document", ["brand", "core"], -40, 64, "Marketing"),
      asset("a2", "Logo pack (light & dark)", "design", ["brand", "logo"], -40, 112, "Marketing"),
      asset("a3", "Nyeri farm photo set", "image", ["farm", "origin", "harvest"], -12, 38, "Content"),
      asset("a4", "Office Coffee sales deck", "presentation", ["sales", "corporate"], -9, 27, "Sales"),
      asset("a5", "Barista Foundations brochure", "document", ["course", "training"], -15, 51, "Training"),
      asset("a6", "Pour-over tutorial (60s)", "video", ["tutorial", "reel"], -4, 19, "Content"),
      asset("a7", "Instagram post template", "template", ["template", "instagram"], -30, 88, "Marketing"),
      asset("a8", "Event bar photo set", "image", ["events", "bar"], -20, 23, "Content"),
      asset("a9", "Wholesale price sheet", "document", ["sales", "wholesale"], -7, 33, "Sales"),
      asset("a10", "Gift box mockups", "design", ["gifting", "corporate"], -2, 9, "Marketing"),
    ],

    tasks: [
      { id: "t1", title: "Approve Riverside case study draft", due: iso(1), owner: "Marketing lead", done: false, area: "Content" },
      { id: "t2", title: "Call Daniel Kiprop about the two-floor proposal", due: iso(0), owner: "Sales", done: false, area: "Leads" },
      { id: "t3", title: "Shoot gift box photos", due: iso(3), owner: "Content", done: false, area: "Content" },
      { id: "t4", title: "Launch TikTok cohort campaign", due: iso(2), owner: "Marketing lead", done: false, area: "Campaigns" },
      { id: "t5", title: "Refresh consent wording on the web shop", due: iso(5), owner: "Operations", done: false, area: "Compliance" },
      { id: "t6", title: "Send October harvest newsletter", due: iso(-6), owner: "Marketing lead", done: true, area: "Email" },
    ],

    activity: [
      { id: "ac1", at: at(0, 9), text: "Flagged the retargeting campaign: CPA is 2.1x the account average, paused pending review.", by: "emma" },
      { id: "ac2", at: at(0, 8), text: "Scored 2 new leads from the website form.", by: "emma" },
      { id: "ac3", at: at(-1, 16), text: "Drafted the Riverside case study and sent it for review.", by: "emma" },
      { id: "ac4", at: at(-1, 11), text: "Moved Daniel Kiprop to Proposal.", by: "team" },
      { id: "ac5", at: at(-2, 15), text: "Repurposed the harvest newsletter into 3 Instagram stories and a LinkedIn post.", by: "emma" },
      { id: "ac6", at: at(-3, 10), text: "Scheduled the corporate gift box broadcast.", by: "team" },
    ],

    compliance: [
      { id: "cc1", area: "Registration", item: "Registered with the ODPC as a data controller", status: "ok", note: "Certificate on file; renew before expiry." },
      { id: "cc2", area: "Consent", item: "Every marketing contact has a recorded opt-in", status: "attention", note: "1 lead (Ahmed Ali, met at an event) has no recorded consent. Don't add to broadcasts yet." },
      { id: "cc3", area: "Opt-out", item: "Every email and WhatsApp broadcast carries an opt-out", status: "ok", note: "Footer and 'reply STOP' in place." },
      { id: "cc4", area: "Privacy notice", item: "Privacy notice published and linked at every sign-up point", status: "attention", note: "Web shop checkout links to an older notice." },
      { id: "cc5", area: "Retention", item: "Lost and cold leads purged or anonymised after 24 months", status: "ok", note: "Quarterly clean-up scheduled." },
      { id: "cc6", area: "Breach response", item: "72-hour ODPC notification plan with a named owner", status: "risk", note: "No named owner yet. Assign one." },
      { id: "cc7", area: "Processors", item: "Contracts with email, ads and CRM providers cover data protection", status: "ok", note: "" },
      { id: "cc8", area: "Cross-border", item: "Transfers outside Kenya documented with safeguards", status: "attention", note: "Ad platforms process data abroad; document the basis." },
    ],

    history: [
      { month: month(-5), spend: 118000, revenue: 690000, leads: 41 },
      { month: month(-4), spend: 126000, revenue: 742000, leads: 47 },
      { month: month(-3), spend: 131000, revenue: 815000, leads: 52 },
      { month: month(-2), spend: 122000, revenue: 798000, leads: 49 },
      { month: month(-1), spend: 140000, revenue: 921000, leads: 58 },
      // Current month is pro-rated to today so month-to-date figures stay believable.
      { month: month(0), spend: Math.round(146000 * monthFraction()), revenue: Math.round(968000 * monthFraction()), leads: Math.round(61 * monthFraction()) },
    ],

    juries: seedJuryCases(),
    usage: [],
  };
}

// A clean deployment for a real client: profile skeleton, no operating data.
export function blankWorkspace(name = "New client"): Workspace {
  const demo = seedWorkspace();
  return {
    ...demo,
    profile: {
      ...demo.profile,
      name, tagline: "", industry: "", location: "Nairobi, Kenya", website: "", demo: false,
      sectors: [], offerings: [], partners: [], keyDates: [],
      brand: { voice: "", pillars: [], doSay: [], dontSay: [], palette: { ...demo.profile.brand.palette } },
    },
    calendar: [], campaigns: [], leads: [], emails: [], library: [], tasks: [], activity: [],
    compliance: demo.compliance.map((c) => ({ ...c, status: "attention" as const, note: "Not yet reviewed for this client." })),
    history: demo.history.map((h) => ({ ...h, spend: 0, revenue: 0, leads: 0 })),
    juries: [],
    usage: [],
  };
}

// ---- builders keep the seed readable

function entry(
  id: string, inDays: number, sector: string, contentType: string, platform: Workspace["calendar"][number]["platform"],
  angle: string, featuredBusiness: string, partnerId: string, offering: string, objective: string, kpi: string,
  audience: string, pillar: string, status: Workspace["calendar"][number]["status"], campaign: string,
): Workspace["calendar"][number] {
  const partners: Record<string, { contact: string; email: string; phone: string; social: string; website: string }> = {
    p1: { contact: "Grace Wanjiru", email: "grace@riverside-hotel.example.com", phone: "+254 700 000 101", social: "@riversidehotel_demo", website: "https://riverside-hotel.example.com" },
    p2: { contact: "Brian Otieno", email: "brian@upperhill-cowork.example.com", phone: "+254 700 000 102", social: "@upperhillcowork_demo", website: "https://upperhill-cowork.example.com" },
    p3: { contact: "Amina Hassan", email: "amina@karura-market.example.com", phone: "+254 700 000 103", social: "@karuramarket_demo", website: "https://karura-market.example.com" },
    p4: { contact: "Peter Mwangi", email: "peter@savannah-culinary.example.com", phone: "+254 700 000 104", social: "@savannahculinary_demo", website: "https://savannah-culinary.example.com" },
  };
  const p = partners[partnerId];
  const bestPractice: Record<string, string> = {
    LinkedIn: "Hook in the first line, 1 idea per slide, post Tue-Thu 8-10am",
    Instagram: "Vertical 9:16, captions on, first 2 seconds carry the hook",
    Blog: "1 primary keyword in title and H1, 1,200+ words, internal links to offering",
    WhatsApp: "Under 60 words, one link, send 10am-12pm, opted-in list only",
    Email: "Subject under 45 chars, one CTA, preview text set",
    TikTok: "Native feel, text on screen, trend audio where it fits",
    YouTube: "Thumbnail with a face, chapter markers, CTA in first comment",
    "Google Business": "Photo + offer + 'Call' button, refresh weekly",
  };
  return {
    id, date: iso(inDays), sector, contentType, platform, angle, featuredBusiness,
    website: p?.website ?? "", keyContact: p?.contact ?? "", email: p?.email ?? "", phone: p?.phone ?? "", socialHandle: p?.social ?? "",
    linkedOffering: offering, objective, kpi, audienceSegment: audience,
    contentMix: platform === "Blog" || platform === "Email" ? "Educate 60 / Promote 40" : "Inspire 50 / Educate 30 / Promote 20",
    bestPractice: bestPractice[platform] ?? "", themePillar: pillar, owner: "Marketing lead",
    draftDue: iso(inDays - 3), reviewDate: iso(inDays - 2), publishDate: iso(inDays), assetLink: "",
    repurposingPlan: "Cut into 3 stories, 1 LinkedIn post and a newsletter section",
    campaign, status,
  };
}

function lead(
  id: string, name: string, company: string, role: string, source: string, stage: Workspace["leads"][number]["stage"],
  score: number, value: number, touchedDaysAgo: number, notes: string, consent: boolean,
): Workspace["leads"][number] {
  const slug = name.toLowerCase().split(" ")[0];
  const domain = company === "Self" ? "mail.example.com" : company.toLowerCase().replace(/[^a-z]+/g, "-").replace(/(^-|-$)/g, "") + ".example.com";
  const n = 200 + Number(id.slice(1));
  return {
    id, name, company, role, email: `${slug}@${domain}`, phone: `+254 700 000 ${n}`, social: `@${slug}_demo`,
    source, stage, score, value, lastTouch: iso(touchedDaysAgo), notes, verified: true, consent,
  };
}

function asset(id: string, title: string, type: Workspace["library"][number]["type"], tags: string[], updatedDaysAgo: number, downloads: number, owner: string): Workspace["library"][number] {
  return { id, title, type, tags, updated: iso(updatedDaysAgo), downloads, owner };
}
