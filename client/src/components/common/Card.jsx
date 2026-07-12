const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`
        rounded-2xl
        border
        border-white/10
        bg-[var(--card)]
        p-6
        shadow-lg
        hover:-translate-y-1
hover:shadow-xl
transition-all
duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;