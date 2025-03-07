import React from "react";

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const RoundRectButton: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 20px",
        borderRadius: "25px",
        backgroundColor: "#007BFF",
        color: "#FFF",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "16px",
        transition: "background-color 0.3s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#007BFF")}
    >
      {label}
    </button>
  );
};

export default RoundRectButton;
