import React, { Context } from 'react';
import { Layout, Menu } from 'antd';
import { Navigation } from '../Home';

export interface HomeHeaderState {
}

export interface HomeHeaderProps {
    setHomeState: Function;
}

const { Header, Content, Footer } = Layout;

class HomeHeader extends React.Component<HomeHeaderProps, HomeHeaderState> {
    state: HomeHeaderState = {
    }

    render(): JSX.Element {
        return (
            <Header>
            
            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']}>
              <Menu.Item key="1" onClick={()=> window.open("http://zehitomo.com", "_blank")}>  
                <img src={require("assets/images/zehitomo-logo.png")} width="50" height="50" />
              </Menu.Item>
              <Menu.Item key="2" onClick={()=>this.props.setHomeState({currentPage: Navigation.SEARCH_PAGE})}>Search Images</Menu.Item>
              <Menu.Item key="3" onClick={()=>this.props.setHomeState({currentPage: Navigation.FAVORITE_PAGE})}>Favorite Images</Menu.Item>
            </Menu>
          </Header>
        )
    }
}

export default HomeHeader