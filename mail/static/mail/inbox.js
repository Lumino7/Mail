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

  let emailsView = document.querySelector('#emails-view');
  let composeView = document.querySelector('#compose-view');
  let contentsView = document.querySelector('#contents-view');

  emailsView.style.display = 'none';
  composeView.style.display = 'block';
  contentsView.style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function load_mailbox(mailbox) {
  let emailsView = document.querySelector('#emails-view');
  let composeView = document.querySelector('#compose-view');
  let contentsView = document.querySelector('#contents-view');

  emailsView.style.display = 'block';
  composeView.style.display = 'none';
  contentsView.style.display = 'none';

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
      let emailListItem = document.createElement('div');
      emailListItem.id = `email-${email.id}`;
      emailListItem.classList.add("list-group-item", "list-group-item-action");

      if (email.read) {
        emailListItem.classList.add("list-group-item-light")
      } else {
        emailListItem.classList.add("font-weight-bold")
      }

      let row = document.createElement('div');
      row.classList.add("row");
      emailListItem.appendChild(row);

      let sender = document.createElement('div');
      sender.innerHTML = email.sender;
      sender.classList.add("pr-0", "col");
      row.appendChild(sender);

      let subject = document.createElement('div');
      subject.innerHTML = email.subject;
      subject.classList.add("pr-0", "col");
      row.appendChild(subject);

      let timestamp = document.createElement('div');
      timestamp.innerHTML = email.timestamp;
      timestamp.classList.add("pr-0", "col");
      row.appendChild(timestamp);

      emailList.appendChild(emailListItem);

      emailListItem.addEventListener('click', (event) => {
        show_email_content(email.id);
      })
    })

    emailsView.appendChild(emailList);
  });
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

function show_email_content(id) {
  let emailsView = document.querySelector('#emails-view');
  let composeView = document.querySelector('#compose-view');
  let contentsView = document.querySelector('#contents-view');

  contentsView.style.display = 'block';
  emailsView.style.display = 'none';
  composeView.style.display = 'none';

  fetch(`/emails/${id}`)
  .then((response) => {
    return response.json();
  })
  .then((result) => {
    if (result.error) {
      alert(result.error);
      return;
    }
  });

  // TODO: render the content
  let wrapper = document.createElement('div');

  let header = document.createElement('div');
  wrapper.appendChild(header);

  let sender = document.createElement('p');
  // sender.innerHTML =

  let recipient = document.createElement('p');

  let subject = document.createElement('p');

  let timestamp = document.createElement('p');
}