import { useState } from 'react';


function Toggle() {

  const [isVisible, setIsVisible] = useState(false);



  const handleToggle = () => {

    setIsVisible(!isVisible);

  };

  return (
    <div>
      <button onClick={handleToggle}>
        {isVisible ? 'Hide' : 'Show'}
      </button>
      {isVisible && <p>Content is visible</p>}
    </div>
  );
}

export default Toggle;