import CrearSala from "../components/CrearSala";
import UnirseSala from "../components/UnirseSala";

export default function Salas({ user }) {
if (!user) {
  return <div>Cargando usuario...</div>;
}
return(

<div>

<h2>Salas de Retos</h2>

<CrearSala user={user}/>
<UnirseSala user={user}/>

</div>

);

}