import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const motivationalQuotes = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Don't stop when you're tired. Stop when you're done.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Success isn't always about greatness. It's about consistency.",
  "The hard days are what make you stronger.",
  "Push yourself because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success starts with self-discipline.",
];

const QuoteCard = () => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);

    const interval = setInterval(() => {
      const newQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      setQuote(newQuote);
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-xl transform hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-start space-x-3">
        <Sparkles className="w-6 h-6 mt-1 flex-shrink-0 animate-pulse" />
        <div>
          <h3 className="font-semibold text-lg mb-2">Daily Motivation</h3>
          <p className="text-white/90 leading-relaxed">{quote}</p>
        </div>
      </div>
    </div>
  );
};

export default QuoteCard;
