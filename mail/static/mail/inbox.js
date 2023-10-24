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
        emailListItem.classList.add("list-group-item-dark")
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
        toggle_email_read_state(email.id);
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

    load_mailbox('sent');
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
  wrapper.id = 'wrapper';

  let header = document.createElement('div');
  header.id = 'header';
  header.classList.add('d-flex');
  wrapper.appendChild(header);

  let details = document.createElement('div');
  details.id = 'details';
  details.classList.add('flex-grow-1');
  header.appendChild(details);

  let actions = document.createElement('div');
  actions.id = 'actions';
  actions.classList.add();
  header.appendChild(actions);

  if (result.sender !== currentUser) {
    let toggleArchiveButton = document.createElement('button');
    actions.appendChild(toggleArchiveButton);
    toggleArchiveButton.id = 'toggle-archive';
    toggleArchiveButton.classList.add('ml-2', 'btn', 'btn-sm', 'btn-primary');
    toggleArchiveButton.innerText = result.archived ? 'Unarchive' : 'Archive';

    toggleArchiveButton.addEventListener('click', (event) => {
      toggle_email_archive_state(result.id, !result.archived)
        .then(() => {
          load_mailbox('inbox');
        });
    })

    let replyButton = document.createElement('button');
    actions.appendChild(replyButton);
    replyButton.id = 'reply';
    replyButton.classList.add('ml-2', 'btn', 'btn-sm', 'btn-success');
    replyButton.innerText = 'Reply';

    replyButton.addEventListener('click', (event) => {
      reply(result);
    })
  }

  /**
   * Sender field
   */
  let senderDiv = document.createElement('div');
  details.appendChild(senderDiv);
  senderDiv.classList.add('d-flex');

  let senderLabel = document.createElement('div');
  senderDiv.appendChild(senderLabel);
  senderLabel.classList.add('pr-2','font-weight-bold');
  senderLabel.innerText = 'Sender:';

  let senderText = document.createElement('div');
  senderDiv.appendChild(senderText);
  senderText.innerText = result.sender;


  /**
   * Recipient field
   */
  let recipientDiv = document.createElement('div');
  details.appendChild(recipientDiv);
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
  let subjectDiv = document.createElement('div');
  details.appendChild(subjectDiv);
  subjectDiv.classList.add('d-flex');

  let subjectLabel = document.createElement('div');
  subjectDiv.appendChild(subjectLabel);
  subjectLabel.classList.add('pr-2','font-weight-bold');
  subjectLabel.innerText = 'Subject:';

  let subjectText = document.createElement('div');
  subjectDiv.appendChild(subjectText);
  subjectText.innerText = result.subject;

  /**
   * Timestamp field
   */
  let timestampDiv = document.createElement('div');
  details.appendChild(timestampDiv);
  timestampDiv.classList.add('d-flex');

  let timestampLabel = document.createElement('div');
  timestampDiv.appendChild(timestampLabel);
  timestampLabel.classList.add('pr-2','font-weight-bold');
  timestampLabel.innerText = 'Timestamp:';

  let timestampText = document.createElement('div');
  timestampDiv.appendChild(timestampText);
  timestampText.innerText = result.timestamp;

  /**
   * Body
   */
  wrapper.appendChild(document.createElement('hr'));

  let body = document.createElement('div');
  body.id = 'body';
  body.innerText = result.body;
  wrapper.appendChild(body);

  contentsView.appendChild(wrapper);
});
}

function toggle_email_read_state(id, state = true) {
  return fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: state
    })
  })
}

function toggle_email_archive_state(id, state = true) {
  return fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: state
    })
  })
}


function reply(emailObject) {
  prepare_view('compose');

  // Pre-fill composition fields
  document.querySelector('#compose-recipients').value = `${emailObject.sender}`;

  let replySubject;

  if (emailObject.subject.startsWith('Re:')){
    replySubject = emailObject.subject;
  } else {
    replySubject = `Re: ${emailObject.subject}`;
  }

  document.querySelector('#compose-subject').value = replySubject;
  document.querySelector('#compose-body').value = `On ${emailObject.timestamp},
  ${emailObject.sender} wrote:\n\n${emailObject.body}`;
}
