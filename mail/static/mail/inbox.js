document.addEventListener('DOMContentLoaded', function () {
  // Use buttons to toggle between views
  document
    .querySelector('#inbox')
    .addEventListener('click', () => load_mailbox('inbox'))
  document
    .querySelector('#sent')
    .addEventListener('click', () => load_mailbox('sent'))
  document
    .querySelector('#archived')
    .addEventListener('click', () => load_mailbox('archive'))
  document.querySelector('#compose').addEventListener('click', compose_email)

  // By default, load the inbox
  load_mailbox('inbox')
})

const handleSubmit = () => {
  const recipients = document.querySelector('#compose-recipients').value
  const subject = document.querySelector('#compose-subject').value
  const body = document.querySelector('#compose-body').value

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({ recipients, subject, body }),
  })
    .then((response) => response.json())
    .then((result) => load_mailbox('sent'))
  return false
}

const renderEmails = (emails, $node, mailbox) => {
  const isInbox = mailbox === 'inbox'
  const $emailsFeed = document.createElement('ul')
  $node.append($emailsFeed)

  emails.forEach((email) => {
    const $div = document.createElement('li')
    $div.className = 'email'
    const emailAddress = isInbox ? email.sender : `To: ${email.recipients[0]}`
    $div.innerHTML = `<div><span>${emailAddress}</span><span>${email.subject}</span>
    </div><span>${email.timestamp}</span>`
    $emailsFeed.append($div)
  })
}

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none'
  document.querySelector('#compose-view').style.display = 'block'

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = ''
  document.querySelector('#compose-subject').value = ''
  document.querySelector('#compose-body').value = ''

  document.querySelector('#compose-form').onsubmit = handleSubmit
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  const $emailsView = document.querySelector('#emails-view')
  const $composeView = document.querySelector('#compose-view')
  $emailsView.style.display = 'block'
  $composeView.style.display = 'none'

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`

  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      renderEmails(emails, $emailsView, mailbox)
    })
}
