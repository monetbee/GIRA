import { Container } from "@/components/ui/container";

const storyIdeas = [
  {
    number: "01",
    title: "WHY GIRA",
    text: "GIRA exists for people who see style as identity, not decoration.",
  },
  {
    number: "02",
    title: "OBJECTS, NOT BASICS",
    text: "We treat sunglasses as objects with attitude, not everyday accessories.",
  },
  {
    number: "03",
    title: "SEE DIFFERENT",
    text: "Different frames. Different mood. Different version of you.",
  },
  {
    number: "04",
    title: "SIGNAL OVER NOISE",
    text: "We build silhouettes that interrupt the ordinary and sharpen your presence.",
  },
];

export default function AboutPage() {
  return (
    <main className="gira-story-page">
      <Container className="gira-story-container">
        <header className="gira-story-intro">
          <p className="gira-kicker gira-story-kicker">GIRA</p>
          <h1 className="gira-story-title">
            <span>GIRA</span>
            <span>GO INSANE.</span>
            <span>REJECT AVERAGE.</span>
          </h1>
          <p className="gira-story-standfirst">WE DON&apos;T MAKE GLASSES TO BLEND IN.</p>
        </header>

        <div className="gira-story-manifesto">
          {storyIdeas.map((idea) => (
            <article key={idea.number} className="gira-story-idea">
              <span className="gira-story-number">{idea.number}</span>
              <div className="gira-story-copy">
                <h2>{idea.title}</h2>
                <p>{idea.text}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </main>
  );
}
