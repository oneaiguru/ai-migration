import { Layout, Typography } from 'antd';
import ForecastPage from './pages/ForecastPage';
import './App.css';

const { Header, Content, Footer } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          MyTKO · Forecast Adapter Demo
        </Typography.Title>
      </Header>
      <Content style={{ padding: '24px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
        <ForecastPage />
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Powered by /api/mytko/forecast · {new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}

export default App;
