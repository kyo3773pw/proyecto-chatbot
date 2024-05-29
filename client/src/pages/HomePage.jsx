/*function HomePage() {
    return(
        <div>HomePage</div>
    )
}

export default HomePage*/

import './HomePage.css'; // Asegúrate de crear y estilizar este archivo CSS

function HomePage() {
    return (
        <div className="homepage-container">
            <header className="homepage-header">
                <h1>Bienvenido a la Universidad</h1>
                <p>Conecta, aprende y crece con nosotros</p>
            </header>
            <section className="homepage-content">
                <div className="homepage-card">
                    <h2 className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2">Acerca de Nosotros</h2>
                    <p className='px-4 py-1 rounded-sm'>Descubre nuestra misión, visión y valores.</p>
                </div>
                <div className="homepage-card">
                    <h2 className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2">Programas Académicos</h2>
                    <p className='px-4 py-1 rounded-sm'>Explora nuestros programas y cursos.</p>
                </div>
                <div className="homepage-card">
                    <h2 className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2">Noticias y Eventos</h2>
                    <p className='px-4 py-1 rounded-sm'>Mantente al día con las últimas noticias y eventos.</p>
                </div>
            </section>
            <footer className="homepage-footer">
                <p>&copy; 2024 Universidad Ejemplo. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}

export default HomePage;
