window.openCalendly = function(){
  if (window.Calendly) {
    Calendly.initPopupWidget({url: 'https://calendly.com/george-a-jeffrey2206/30min'});
  } else {
    alert('Calendly is still loading. Please try again in a moment.');
  }
  return false;
}

async function handleContactSubmit(e){
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  if(!data.name || !data.email || !data.message){
    setStatus('Please fill in your name, email, and message.', true);
    return;
  }
  try {
    setStatus('Sending...');
    const res = await fetch('/api/contact', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if(json.ok){
      setStatus('Message sent! Check your inbox for an instant reply.', false, true);
      form.reset();
    }else{
      setStatus('Something went wrong. Please email us directly.', true);
    }
  } catch {
    setStatus('Network error. Please try again or email us directly.', true);
  }
}

function setStatus(msg, isError=false, isSuccess=false){
  const el = document.getElementById('form-status');
  if(!el) return;
  el.textContent = msg;
  el.className = isError ? 'error' : (isSuccess ? 'success' : 'small');
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if(form){ form.addEventListener('submit', handleContactSubmit); }
});
