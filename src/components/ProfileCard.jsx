import React from "react";
import styled from "styled-components";

export default function ProfileCard({ user }) {

  const avatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;

  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0];

  return (
    <StyledWrapper>
      <div className="main">

        {/* CONTACTO */}

        <div id="c2" className="card">
          <div className="card-info">

            <div className="contact-title">Contacto</div>

            <div className="card-contact">
              <li className="icon-contact">
                Email: {user?.email}
              </li>
            </div>

          </div>
        </div>


        {/* INFO USUARIO */}

        <div id="c3" className="card">
          <div className="card-info">

            <li className="address-title">Cuenta</li>

            <li className="address">
              ID: {user?.id?.slice(0,8)}
            </li>

            <li className="address">
              Provider: {user?.app_metadata?.provider}
            </li>

          </div>
        </div>


        {/* PERFIL PRINCIPAL */}

        <div id="c1" className="card">
          <div className="card-info">

            <div className="card-avatar">

              {avatar ? (
                <img
                  src={avatar}
                  alt="avatar"
                  style={{
                    width:"100%",
                    height:"100%",
                    borderRadius:"50%"
                  }}
                />
              ) : null}

            </div>

            <div className="card-title">
              {name}
            </div>

            <div className="card-subtitle">
              {user?.email}
            </div>

          </div>
        </div>

      </div>
    </StyledWrapper>
  );
}


const StyledWrapper = styled.div`

.main{
display:grid;
place-items:center;
width:220px;
height:260px;
}

.card{
width:220px;
height:260px;
background:#ffffff;
padding:2rem 1.5rem;
border-radius:16px;
transition:box-shadow .3s ease, transform .2s ease;
display:flex;
flex-direction:column;
position:absolute;
border:1px solid #e2e8f0;
}

.card:hover{
box-shadow:0 10px 50px rgba(79,70,229,0.25);
}

.card-info{
display:flex;
flex-direction:column;
justify-content:center;
align-items:center;
}

.card-avatar{
width:100px;
height:100px;
border-radius:50%;
overflow:hidden;
background:linear-gradient(135deg,#4f46e5,#7c3aed);
}

.card-title{
color:#2d3436;
font-size:1.4rem;
font-weight:700;
margin-top:10px;
}

.card-subtitle{
color:#636e72;
font-size:0.9rem;
}

.address-title{
color:#2d3436;
font-size:1rem;
font-weight:600;
list-style:none;
}

.address{
color:#636e72;
font-size:0.9rem;
list-style:none;
}

.contact-title{
color:#2d3436;
font-size:1.4rem;
font-weight:600;
}

.card-contact{
color:#636e72;
font-size:0.9rem;
}

.icon-contact{
list-style:none;
display:flex;
align-items:center;
}

.main:hover #c1{
transform:translateX(0px);
}

.main:hover #c2{
transform:translateX(220px);
}

.main:hover #c3{
transform:translateX(-220px);
}

`;