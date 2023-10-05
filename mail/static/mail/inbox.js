document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit', send_email);


  // By default, load the inbox
  load_mailbox('inbox');
});



function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function load_mailbox(mailbox) {
  let emailsView = document.querySelector('#emails-view');
  let composeView = document.querySelector('#compose-view');

  // Show the mailbox and hide other views
  emailsView.style.display = 'block';
  composeView.style.display = 'none';

  // Show the mailbox name
  emailsView.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)

  .then((response) => {
    return response.json();
  })
  .then((result) => {
    if (result.error) {
      alert(result.error);
      return;
    }

    let emailList = document.createElement('div');
    emailList.id = 'email-list';
    emailList.classList.add("list-group");

    result.forEach((email) => {
      let element = document.createElement('div');
      element.id = `email-${email.id}`;
      element.classList.add("list-group-item", "list-group-item-action", "d-flex");

      let sender = document.createElement('div');
      sender.innerHTML = email.sender;
      element.appendChild(sender);
      sender.classList.add("pr-2");

      let subject = document.createElement('div');
      subject.innerHTML = email.subject;
      element.appendChild(subject);
      subject.classList.add("pr-2", "col");

      let timestamp = document.createElement('div');
      timestamp.innerHTML = email.timestamp;
      element.appendChild(timestamp);

      emailList.appendChild(element);
    })

    emailsView.appendChild(emailList);

  });







  // Each email should then be rendered in its own box (e.g. as a <div> with a border) that displays who the email is from, what the subject line is, and the timestamp of the email.
  // If the email is unread, it should appear with a white background. If the email has been read, it should appear with a gray background.
}

function send_email(event) {
  event.preventDefault();

  let form = document.querySelector('#compose-form');
  let mailobject = new FormData(form);

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: mailobject.get('compose-recipients'),
      subject: mailobject.get('compose-subject'),
      body: mailobject.get('compose-body')
    })
  })
  .then((response) => {
    return response.json();
  })
  .then((result) => {
    if (result.error) {
      alert(result.error);
      return;
    }

    load_mailbox('inbox');
  });
}