'use client';



import dynamic from 'next/dynamic';



const Background3D = dynamic(() => import('@/components/Background3D'), {

ssr: false,

});



export default function Painel() {

return (

<main

style={{

position: 'relative',

width: '100%',

minHeight: '100vh',

overflow: 'hidden',

background: '#090909',

}}

>

<Background3D />



<div

style={{

position: 'relative',

zIndex: 10,

padding: 40,

textAlign: 'center',

color: '#fff',

}}

>

<h1>Dashboard Slim Checkpoint</h1>



<p>O sistema está online!</p>



<p>Aqui aparecerão seus dados de acessos.</p>

</div>

</main>

);

}