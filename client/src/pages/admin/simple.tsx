// Super simple test page with minimal JSX and no hooks

const SimplePage = () => {
  // Basic JavaScript without hooks or complex React features
  const pageTitle = "Simple React Test";
  const currentTime = new Date().toLocaleTimeString();
  
  // Simple function
  const getBackgroundColor = () => '#f0f9ff';
  
  return (
    <div style={{ padding: '2rem' }}>
      <h1>{pageTitle}</h1>
      <div style={{ 
        backgroundColor: getBackgroundColor(),
        padding: '1rem', 
        border: '1px solid #3b82f6',
        borderRadius: '0.5rem',
        marginTop: '1rem'
      }}>
        <p>Current time when page loaded: {currentTime}</p>
        <p>This is a very simple React page with minimal features.</p>
      </div>
    </div>
  );
};

export default SimplePage;