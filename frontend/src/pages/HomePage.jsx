import React from 'react';
import Header2 from '../components/Header2';
import MovingHeader from '../components/MovingHeader';
import MainContent from './MainContent';
import MovingFooter from '../components/MovingFooter';
import Footer from '../components/Footer';

function HomePage() {
  return (
    <div>
      <Header2 />
      <MovingHeader />
      <MainContent />
      <MovingFooter />
      <Footer />
    </div>
  );
}

export default HomePage;
