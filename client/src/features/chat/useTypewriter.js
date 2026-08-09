import { useState, useEffect, useRef } from "react";

/**
 * Progressively reveals text, giving replies a "being written" feel.
 *
 * Reveals by WORD rather than character: at ~18ms/char a long paragraph would
 * take many seconds and feel sluggish, and re-rendering markdown per character
 * is wasteful. Word-stepping looks natural and is far cheaper.
 *
 * Honours prefers-reduced-motion by showing the full text immediately.
 */
export const useTypewriter = (fullText = "", { enabled = true, wordsPerTick = 2, tickMs = 40 } = {}) => {
  const [shown, setShown] = useState(enabled ? "" : fullText);
  const timer = useRef(null);

  useEffect(() => {
    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    if (!enabled || reduceMotion || !fullText) {
      setShown(fullText);
      return;
    }

    const words = fullText.split(/(\s+)/); // keep whitespace so layout is stable
    let i = 0;
    setShown("");

    timer.current = setInterval(() => {
      i += wordsPerTick * 2; // account for the whitespace tokens
      if (i >= words.length) {
        setShown(fullText);
        clearInterval(timer.current);
      } else {
        setShown(words.slice(0, i).join(""));
      }
    }, tickMs);

    return () => clearInterval(timer.current);
  }, [fullText, enabled, wordsPerTick, tickMs]);

  const done = shown === fullText;
  // Let the caller skip the animation (e.g. user scrolled away / clicked).
  const finish = () => { clearInterval(timer.current); setShown(fullText); };

  return { shown, done, finish };
};

export default useTypewriter;
