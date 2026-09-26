import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { CustomerAuthenticationError, getCustomerProfile } from "@/lib/customer-account";
import { CUSTOMER_SESSION_COOKIE, getCustomerSession } from "@/lib/customer-session";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ reauth?: string }> }) {
  const sessionCookie = (await cookies()).get(CUSTOMER_SESSION_COOKIE)?.value;
  const session = getCustomerSession(sessionCookie);
  const reauth = (await searchParams).reauth === "1";
  if (!session && sessionCookie && !reauth) redirect("/account/reauth");
  if (!session) return <main className="gira-account-page">
    <Container className="gira-account-container">
      <p className="gira-kicker">GIRA CLUB</p>
      <h1>SIGN IN</h1>
      <p className="gira-account-message">Sign in to view your GIRA CLUB account.</p>
      <Link href="/account/login?returnTo=/account" className="gira-account-logout">JOIN / SIGN IN</Link>
    </Container>
  </main>;

  let customer = null;
  try {
    customer = await getCustomerProfile(session.accessToken);
  } catch (error) {
    if (error instanceof CustomerAuthenticationError) redirect("/account/reauth");
  }

  if (!customer) return <main className="gira-account-page">
    <Container className="gira-account-container">
      <p className="gira-kicker">GIRA CLUB</p>
      <h1>ACCOUNT UNAVAILABLE</h1>
      <p className="gira-account-message">We could not load your account details. Please sign in again.</p>
      <Link href="/account/login?returnTo=/account" className="gira-account-logout">SIGN IN AGAIN</Link>
    </Container>
  </main>;

  return <main className="gira-account-page">
    <Container className="gira-account-container">
      <section className="gira-account-hero" aria-labelledby="gira-club-title">
        <p className="gira-account-eyebrow">GIRA CLUB</p>
        <h1 id="gira-club-title">WELCOME BACK.</h1>
        <p className="gira-account-intro">YOUR WORLD. YOUR SPARK.</p>
      </section>

      <section className="gira-account-overview" aria-labelledby="member-overview-title">
        <div className="gira-account-section-heading">
          <p>01</p>
          <h2 id="member-overview-title">MEMBER OVERVIEW</h2>
        </div>
        <div className="gira-account-overview-grid">
          <article className="gira-account-member-card">
            <p className="gira-account-label">MEMBER</p>
            <p className="gira-account-email">{customer.email || "—"}</p>
          </article>
          <article className="gira-account-metric-card gira-account-sparks-card">
            <p className="gira-account-label">SPARKS <span aria-hidden="true">⚡</span></p>
            <p className="gira-account-coming-soon">COMING SOON</p>
            <p>Rewards</p>
          </article>
          <article className="gira-account-metric-card">
            <p className="gira-account-label">ORDERS</p>
            <p className="gira-account-coming-soon">COMING SOON</p>
            <p>Your order history will live here.</p>
          </article>
        </div>
      </section>

      <section className="gira-account-sparks" aria-labelledby="sparks-title">
        <div>
          <p className="gira-account-label">02 / GIRA CLUB</p>
          <h2 id="sparks-title">SPARKS</h2>
        </div>
        <div className="gira-account-sparks-copy">
          <p>Earn SPARKS every time you shop.</p>
          <dl>
            <div><dt>1 SPARK</dt><dd>¥1 SPENT</dd></div>
            <div><dt>20 SPARKS</dt><dd>¥1 REWARD</dd></div>
          </dl>
          <p className="gira-account-rewards-link">EXPLORE REWARDS <span aria-hidden="true">↗</span></p>
        </div>
      </section>

      <section className="gira-account-settings" aria-labelledby="account-title">
        <div className="gira-account-section-heading">
          <p>03</p>
          <h2 id="account-title">ACCOUNT</h2>
        </div>
        <div className="gira-account-settings-row">
          <div><p className="gira-account-label">EMAIL</p><p className="gira-account-email">{customer.email || "—"}</p></div>
          <form action="/account/logout" method="post"><button type="submit" className="gira-account-logout">LOG OUT</button></form>
        </div>
      </section>
    </Container>
  </main>;
}
