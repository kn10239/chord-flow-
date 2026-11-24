// Access counting has been discontinued. Old cached clients cannot increment the database.
export function onRequest(){return new Response(null,{status:410,headers:{"Cache-Control":"no-store"}});}
