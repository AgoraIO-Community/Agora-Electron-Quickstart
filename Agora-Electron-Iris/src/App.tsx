import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from 'react-router-dom';
import {
  HomeOutlined,
  DingtalkOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import './App.global.scss';
import { Layout, Menu } from 'antd';
import basicRoutes from './examples/basic';
import AuthInfoScreen from './examples/AuthInfoScreen';

const { Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

class App extends React.Component {
  state = {
    collapsed: false,
  };

  onCollapse = (collapsed) => {
    console.log(collapsed);
    this.setState({ collapsed });
  };

  render() {
    const { collapsed } = this.state;
    return (
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider collapsible collapsed={collapsed} onCollapse={this.onCollapse}>
            <div className="logo" />
            <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
              <Menu.Item key="1" icon={<InfoCircleOutlined />}>
                <Link to="/">Setting</Link>
              </Menu.Item>
              <SubMenu key="sub1" icon={<HomeOutlined />} title="Basic">
                {basicRoutes.map(({ path, title }, index) => {
                  return (
                    <Menu.Item key={`${index} ${title}`}>
                      <Link to={path}>{title}</Link>
                    </Menu.Item>
                  );
                })}
              </SubMenu>
              <SubMenu key="sub2" icon={<DingtalkOutlined />} title="Advanced">
                <Menu.Item key="6">Team 1</Menu.Item>
                <Menu.Item key="8">Team 2</Menu.Item>
              </SubMenu>
            </Menu>
          </Sider>
          <Layout className="site-layout">
            <Content>
              <Switch>
                <Route path="/" children={<AuthInfoScreen />} exact={true} />
                {basicRoutes.map((route, index) => (
                  <Route
                    key={`${index}`}
                    path={route.path}
                    children={<route.component />}
                  />
                ))}
                <Route path="*">
                  <Redirect to="/" />
                </Route>
              </Switch>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
              Agora Design ©2021 Created by Jerry.Luo
            </Footer>
          </Layout>
        </Layout>
      </Router>
    );
  }
}

export default App;
