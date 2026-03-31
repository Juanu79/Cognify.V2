import { useState } from "react";
import { unirseSala } from "../services/salaService";

export default function UnirseSala({ user }) {

const [codigo,setCodigo] = useState("");

const handleUnirse = async () => {

const { sala, error } = await unirseSala(codigo,user.id);

if(error){
alert(error);
}else{
alert("Entraste a la sala");
}

};

return(

<div>

<input
placeholder="Código de sala"
value={codigo}
onChange={(e)=>setCodigo(e.target.value)}
/>

<button onClick={handleUnirse}>
Entrar
</button>

</div>

);

}