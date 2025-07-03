import React from 'react'

const PageNotFound = () => {
  return (
    <div style={{textAlign: "center"}}>
        <p style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: "800",
            marginBottom: "1.5rem",
            color: "var(--primary)"
        }}>
        Page Not Found
        </p>
    </div>
  )
}

export default PageNotFound