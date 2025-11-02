import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import Progress from './pages/Progress';
import PoseTracking from './pages/PoseTracking';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/pose" element={<PoseTracking />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App;
