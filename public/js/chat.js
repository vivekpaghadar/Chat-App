const socket = io()

//Elements

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $messageFormLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//template
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $mapTemplate = document.querySelector('#map-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


// Options
const {username,room} = Qs.parse(location.search,{ ignoreQueryPrefix: true })

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const contentHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(contentHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message) => {
    console.log(message)
    const html = Mustache.render($messageTemplate,{
        username : message.username,
        message : message.text,
        createdAt: moment(message.createdAt).format('h:mm  a')
    })
    $messages.insertAdjacentHTML('beforeend',html)  
    autoscroll()  
})

socket.on('LocationMessage',(message) =>{
    console.log(message)
    const html = Mustache.render($mapTemplate,{
        username : message.username,
        url : message.url,
        createdAt : moment(message.createdAt).format('h:mm  a')
    })  
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users}) =>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })  
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e) =>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage',message,(error) =>{
        $messageFormButton.focus()
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''

        if(error){
            return console.log(error)
        }
        console.log('the message was delivered')
    })

})


document.querySelector('#send-location').addEventListener('click',() =>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    $messageFormLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position) =>{
        const latlong = {
            lat : position.coords.latitude,
            long: position.coords.longitude
        }
        // const jsonData = JSON.stringify(latlong)
        socket.emit("SendLocation",latlong,(error) =>{
            $messageFormLocationButton.removeAttribute('disabled')
            if(error){
                return console.log(error)
            }
            console.log('The location was delivered')
        })

    })
}) 

socket.emit('join',{username, room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})
 