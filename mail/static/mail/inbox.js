// GLOBAL QUERY SELECTORS

let $emailsView
let $composeView
let $emailDetailView
let $composeRecipients
let $composeSubject
let $composeBody

const EMAILS_VIEW_ID = 'emails-view'
const COMPOSE_VIEW_ID = 'compose-view'
const EMAIL_DETAIL_VIEW_ID = 'email-detail-view'

// UTILS

const $ = (element) => document.querySelector(element)

const setVisibleView = (viewIdToDisplay) => {
  [$emailsView, $composeView, $emailDetailView].forEach(element => {
    element.style.display = element.id === viewIdToDisplay ? 'block' : 'none'
  })
}

document.addEventListener('DOMContentLoaded', function () {
  // Use buttons to toggle between views
  $('#inbox').addEventListener('click', () => load_mailbox('inbox'))
  $('#sent').addEventListener('click', () => load_mailbox('sent'))
  $('#archived').addEventListener('click', () => load_mailbox('archive'))
  $('#compose').addEventListener('click', compose_email)

  $emailsView = $(`#${EMAILS_VIEW_ID}`)
  $composeView = $(`#${COMPOSE_VIEW_ID}`)
  $emailDetailView = $(`#${EMAIL_DETAIL_VIEW_ID}`)

  $composeRecipients = $('#compose-recipients')
  $composeSubject = $('#compose-subject')
  $composeBody = $('#compose-body')

  // By default, load the inbox
  load_mailbox('inbox')
})

// API //

const getEmailById = (id) => {
  return fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => email)
}

const getEmailsByMailbox = (mailbox) => {
  return fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => emails)
}

const postEmail = (body) => {
  return fetch('/emails', {
    method: 'POST',
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((result) => result)
}

// HANDLERS //

const handleSubmit = () => {
  const recipients = $composeRecipients.value
  const subject = $composeSubject.value
  const body = $composeBody.value

  postEmail({ recipients, subject, body }).then(() => {
    load_mailbox('sent')
  })
  return false
}

const handleEmailClick = (email, mailbox) => {
  renderEmailDetail(email, $emailDetailView, mailbox)
}

const handleReplyClick = (email) => {
  console.log(email)
  setVisibleView(COMPOSE_VIEW_ID)
  $composeRecipients.value = email.sender
  $composeSubject.value = email.subject.startsWith('Re: ') ? email.subject : `Re: ${email.subject}`
  $composeBody.value = `On ${email.timestamp} ${email.sender} wrote:
    ${email.body}
  `
  $composeBody.focus()

}

// RENDERERS

const renderEmails = (emails, $node, mailbox) => {
  const isInbox = mailbox === 'inbox'
  const $emailsFeed = document.createElement('ul')
  $node.append($emailsFeed)

  emails.forEach((email) => {
    // TO DO: change clickable div for a button
    const $div = document.createElement('div')
    $div.className = 'email'
    const emailAddress = isInbox ? email.sender : `To: ${email.recipients[0]}`
    $div.innerHTML = `<div><span class="font-weight-bold">${emailAddress}</span><span>${email.subject}</span>
    </div><span class="text-secondary">${email.timestamp}</span>`
    $div.onclick = () => handleEmailClick(email)
    $emailsFeed.append($div)
  })
}

const renderEmailDetail = (email, $node) => {
  $emailsView.style.display = 'none'
  $node.style.display = 'block'
  $node.innerHTML = `
    <div class="email-detail">
      <div><span class="font-weight-bold">From: </span>${email.sender}</div>
      <div><span class="font-weight-bold">To: </span>${email.recipients.join(' ')}</div>
      <div><span class="font-weight-bold">Subject: ${email.subject}</span></div>
      <div><span class="font-weight-bold">Timestamp: </span>${email.timestamp}</div>
    </div>
    <button class="btn btn-sm btn-outline-primary mt-2" id="reply">Reply</button>
    <hr>
    <article>${email.body}</article>
  `
  $('#reply').onclick = () => handleReplyClick(email)
  }
// MAIN FUNCTIONS //

function compose_email() {
  // Show compose view and hide other views
  setVisibleView(COMPOSE_VIEW_ID)

  // Clear out composition fields
  $composeRecipients.value = ''
  $composeSubject.value = ''
  $composeBody.value = ''

  $('#compose-form').onsubmit = handleSubmit
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  setVisibleView(EMAILS_VIEW_ID)

  // Show the mailbox name
  $emailsView.innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`

  getEmailsByMailbox(mailbox).then((emails) => {
    renderEmails(emails, $emailsView, mailbox)
  })
}
