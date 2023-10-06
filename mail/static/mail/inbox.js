let emailsView;
let composeView;
let contentsView;

document.addEventListener('DOMContentLoaded', function() {
  emailsView = document.querySelector('#emails-view');
  composeView = document.querySelector('#compose-view');
  contentsView = document.querySelector('#contents-view');

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit', send_email);


  // By default, load the inbox
  load_mailbox('inbox');
});

function prepare_view(view) {
  emailsView.style.display = 'none';
  composeView.style.display = 'none';
  contentsView.style.display = 'none';

  let activeView = document.querySelector(`#${view}-view`);
  activeView.style.display = 'block';

  contentsView.innerHTML = '';
  emailsView.innerHTML = '';
}

function compose_email() {
  prepare_view('compose');

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function load_mailbox(mailbox) {
  prepare_view('emails');

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
        put_as_read(email.id);
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
  prepare_view('contents');

  fetch(`/emails/${id}`)
  .then((response) => {
    return response.json();
  })
  .then((result) => {
    if (result.error) {
      alert(result.error);
      return;
    }

  let wrapper = document.createElement('div');

  let header = document.createElement('div');
  wrapper.appendChild(header);

  /**
   * Sender field
   */
  let sender = document.createElement('div');
  header.appendChild(sender);
  sender.classList.add('d-flex');

  let senderLabel = document.createElement('div');
  sender.appendChild(senderLabel);
  senderLabel.classList.add('pr-2','font-weight-bold');
  senderLabel.innerText = 'From:';

  let senderList = document.createElement('div');
  sender.appendChild(senderList);
  senderList.innerText = result.sender;

  /**
   * Recipient field
   */
  let recipientDiv = document.createElement('div');
  header.appendChild(recipientDiv);
  recipientDiv.classList.add('d-flex');

  let recipientLabel = document.createElement('div');
  recipientDiv.appendChild(recipientLabel);
  recipientLabel.classList.add('pr-2','font-weight-bold');
  recipientLabel.innerText = 'To:';

  let recipientList = document.createElement('div');
  result.recipients.forEach((recipient) => {
    let recipientItem = document.createElement('div');
    recipientItem.innerHTML = recipient;
    recipientList.appendChild(recipientItem);
  });

  recipientDiv.appendChild(recipientList);

  /**
   * Subject field
   */
  let subject = document.createElement('p');
  header.appendChild(subject);
  subject.innerHTML = `<span class=font-weight-bold>Subject: </span> ${result.subject}`;
  subject.style.margin = '0';

  let timestamp = document.createElement('p');
  header.appendChild(timestamp);
  timestamp.innerHTML = `<span class=font-weight-bold>Timestamp: </span> ${result.timestamp}`;


  wrapper.appendChild(document.createElement('hr'));

  let body = document.createElement('p');
  body.innerText = result.body;
  wrapper.appendChild(body);

  contentsView.appendChild(wrapper);
});
}

function put_as_read(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}