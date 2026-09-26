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

  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ");
  return <main className="gira-account-page">
    <Container className="gira-account-container">
      <p className="gira-kicker">GIRA CLUB</p>
      <h1>{name || "GIRA MEMBER"}</h1>
      <section className="gira-account-card" aria-label="Account details">
        <p className="gira-account-label">EMAIL</p>
        <p className="gira-account-email">{customer.email || "—"}</p>
      </section>
      <form action="/account/logout" method="post"><button type="submit" className="gira-account-logout">LOG OUT</button></form>
    </Container>
  </main>;
}
