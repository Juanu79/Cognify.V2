import { crearSala } from "../services/salaService";

export default function CrearSala({ user }) {

const handleCrear = async () => {

const { data, error } = await crearSala(user.id);

if(error){
alert(error.message);
}else{
alert("Sala creada: " + data.codigo);
}

};

return (
<button onClick={handleCrear}>
Crear Sala
</button>
);

}