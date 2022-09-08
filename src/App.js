import "./App.css";
import React, { useEffect, useState, useRef } from "react";
// import Stage from "./stage";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import artwork from "./artwork/artwork";

// Music by <a href="/users/natureseye-18615106/?tab=audio&amp;utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=audio&amp;utm_content=8028">NaturesEye</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=music&amp;utm_content=8028">Pixabay</a>

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const canvasRef = useRef(null);
  const quoteRef = useRef(null);

  const [stage, setStage] = useState(0);
  const [prevStage, setPrevStage] = useState(0);

  const stages = [
    "I G N O R A N C E",
    "A W A R E N E S S",
    "H E S I T A N C E",
    "A C C E P T A N C E",
  ];
  const quotes = [
    "All journeys have secret destinations of which the traveler is unaware. - Martin Buber",
    "What is necessary to change a person is to change his awareness of himself. - Abraham Maslow",
    "Doubt is the vestibule through which all must pass before they can enter into the temple of wisdom. - Charles Caleb Colton",
    "For after all, the best thing one can do when it is raining is let it rain. ― Henry Wadsworth Longfellow",
  ];

  useEffect(() => {
    if (!artwork.isSetup) {
      artwork.isSetup = true;
      artwork.setup(canvasRef.current);
    }
  }, []);

  useEffect(() => {
    function resize() {
      artwork.resize(window.innerWidth, window.innerHeight);
    }

    function onMouseMove(event) {
      artwork.onMouseMove(event);
    }

    window.addEventListener("resize", resize);
    document.addEventListener("mousemove", onMouseMove);

    return function cleanup() {
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    console.log(stage);
    const tl = gsap.timeline();
    tl.from(
      ".button",
      {
        autoAlpha: 0,
        y: 20,
        duration: 1,
      },
      "start"
    )
      .from(
        ".mainTitle",
        {
          autoAlpha: 0,
          y: -20,
          duration: 1,
        },
        "start"
      )
      .from(".stage", {
        autoAlpha: 0,
        duration: 1,
      })
      .from(
        ".quotes",
        {
          autoAlpha: 0,
          duration: 1,
        },
        "<+=0.5"
      );
  }, []);

  function handleStageUpdate(newStage, ref) {
    setPrevStage(stage);
    setStage(newStage);

    gsap.from(".stage", {
      autoAlpha: 0,
      duration: 1,
    });
    gsap.from(ref.current, {
      autoAlpha: 0,
      y: -10,
      duration: 1,
    });
    // the 'newStage' is the current stage and 'stage' is now prevStage
    artwork.updateMaterial(newStage, stage);
  }

  return (
    <main className="App">
      <div className="canvas" ref={canvasRef} />
      <div className="ui-container">
        <div className="mainTitle">
          <p>the stages of growth</p>
        </div>
        <div className="stage">
          <h1>{stages[stage]}</h1>
        </div>
        <div ref={quoteRef} className="quotes">
          <p>{quotes[stage]}</p>
        </div>
        <div className="stages">
          <button
            id="btn1"
            className="button"
            onClick={() => handleStageUpdate(0, quoteRef)}
          >
            i g n o r a n c e
          </button>
          <button
            id="btn2"
            className="button"
            onClick={() => handleStageUpdate(1, quoteRef)}
          >
            a w a r e n e s s
          </button>
          <button
            id="btn3"
            className="button"
            onClick={() => handleStageUpdate(2, quoteRef)}
          >
            h e s i t a n c e
          </button>
          <button
            id="btn4"
            className="button"
            onClick={() => handleStageUpdate(3, quoteRef)}
          >
            a c c e p t a n c e
          </button>
        </div>
      </div>
    </main>
  );
}
