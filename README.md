# ChattApp-tsx
# Detta projekt använder socket.io för att bygga en realtidschat där användarna ska kunna chatta med varandra och skapa olika chatrum. 
# Du kommer först till en inloggningssida där du får skapa ditt användarnamn. 
# Därefter hamnar du i en "Lobby". Där du kan chatta med andra användare samt ska nya rum att chatta i. Det är bara möjligt att vara i ett rum åt gången. Du kan byta rum i en lista till vänster där alla aktiva rum listas. Lobbyn finns alltid kvar oavsett om någon användare finns där eller inte.
# Under varje aktivt rum visas också namnen på de användare som är i rummet.
# När någon skriver i chatten så syns det att någon skriver och vem som skriver.
# Du kan skicka en random gif genom att i meddelandet skriva kommandot: /gif
# Vi har använt oss av dotenv för att göra vår api nyckel skyddad. Du får själv skapa en .env fil och klistra in den. (Vi bifogar den i vår inlämning)
# Projektet är byggt med express och react (typescript) samt socket.io/ socket.io-client. 
# För att client och server ska kunna kommunicera med varandra har cors använts.
# För att starta projektet: 
# Ladda ner projektet från GitHub.
# Öppna terminalen i vs code. Öppna en terminal för server och en för client. Gör en npm install i varje mapp.
# För att starta servern i server mappen skriv: npm start, i client mappen startas servern med npm run dev. Projektet ligger på localhost:5173