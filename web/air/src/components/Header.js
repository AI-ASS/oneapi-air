import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/User';

import { Button, Container, Dropdown, Icon, Menu, Segment } from 'semantic-ui-react';
import { API, getLogo, getSystemName, isAdmin, isMobile, showSuccess } from '../helpers';
import '../index.css';

// Header Buttons
let headerButtons = [
  {
    name: '首页',
    to: '/',
    icon: 'globe'
  },
  {
    name: '渠道',
    to: '/channel',
    icon: 'sitemap',
    admin: true
  },
  {
    name: '令牌',
    to: '/token',
    icon: 'key'
  },
  {
    name: '兑换',
    to: '/redemption',
    icon: 'sync alternate',
    admin: true
  },
  {
    name: '充值',
    to: '/topup',
    icon: 'cart'
  },
  {
    name: '用户',
    to: '/user',
    icon: 'user',
    admin: true
  },
  {
    name: '日志',
    to: '/log',
    icon: 'book'
  },
  {
    name: '设置',
    to: '/setting',
    icon: 'setting'
  },
  {
    name: '模型',
    to: '/about',
    icon: 'info circle'
  }
];

if (localStorage.getItem('chat_link')) {
  headerButtons.splice(1, 0, {
    name: '聊天',
    to: '/chat',
    icon: 'comments'
  });
}

const Header = () => {
  const [userState, userDispatch] = useContext(UserContext);
  let navigate = useNavigate();
  let location = useLocation();

  const [showSidebar, setShowSidebar] = useState(false);
  const [systemName, setSystemName] = useState(getSystemName());
  const logo = getLogo();

  useEffect(() => {
    // if systemName, wait 500ms and check again, if still no systemName, check 500ms again
    let remainCheckTimes = 5;
    const timer = setInterval(() => {
      if (remainCheckTimes <= 0) {
        clearInterval(timer);
        return;
      }
      remainCheckTimes--;
      let system_name = getSystemName();
      if (system_name) {
        setSystemName(system_name);
        clearInterval(timer);
      }
    }, 500);
  })

  async function logout() {
    setShowSidebar(false);
    await API.get('/api/user/logout');
    showSuccess('注销成功!');
    userDispatch({ type: 'logout' });
    localStorage.removeItem('user');
    navigate('/login');
  }

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const renderButtons = (isMobile) => {
    return headerButtons.map((button) => {
      let active = location.pathname === button.to;
      let buttonClass = active ? 'activeButton' : '';
      if (userState.user && button.name === '首页') return <></>;
      if ((!userState.user && ['渠道', '令牌', '兑换', '充值', '用户', '日志', '设置'].includes(button.name)) || (button.admin && !isAdmin())) return <></>;
      if (button.admin && !isAdmin()) return <></>;
      if (isMobile) {
        return (
          <Menu.Item
            className={buttonClass}
            onClick={() => {
              navigate(button.to);
              setShowSidebar(false);
            }}
          >
            <span className={buttonClass}>{button.name}</span>
          </Menu.Item>
        );
      }
      return (
        <Menu.Item key={button.name} as={Link} to={button.to} className={buttonClass}>
          <Icon name={button.icon} />
          <span className={buttonClass}>{button.name}</span>
        </Menu.Item>
      );
    });
  };

  if (isMobile()) {
    return (
      <>
        <Menu
          borderless
          size='large'
          style={
            showSidebar
              ? {
                borderBottom: 'none',
                marginBottom: '0',
                borderTop: 'none',
                height: '51px'
              }
              : { borderTop: 'none', height: '52px' }
          }
        >
          <Container>
            <Menu.Item as={Link} to='/'>
              <img
                src={logo}
                alt='logo'
                style={{ marginRight: '0.75em' }}
              />
              <div style={{ fontSize: '20px' }}>
                <b>{systemName}</b>
              </div>
            </Menu.Item>
            <Menu.Menu position='right'>
              <Menu.Item onClick={toggleSidebar}>
                <Icon name={showSidebar ? 'close' : 'sidebar'} />
              </Menu.Item>
            </Menu.Menu>
          </Container>
        </Menu>
        {showSidebar ? (
          <Segment style={{ marginTop: 0, borderTop: '0' }}>
            <Menu secondary vertical style={{ width: '100%', margin: 0 }}>
              {renderButtons(true)}
              <Menu.Item>
                {userState.user ? (
                  <Button onClick={logout}>注销</Button>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        setShowSidebar(false);
                        navigate('/login');
                      }}
                    >
                      登录
                    </Button>
                    <Button
                      onClick={() => {
                        setShowSidebar(false);
                        navigate('/register');
                      }}
                    >
                      注册
                    </Button>
                  </>
                )}
              </Menu.Item>
            </Menu>
          </Segment>
        ) : (
          <></>
        )}
      </>
    );
  }

  return (
    <>
      <Menu borderless style={{ borderTop: 'none' }}>
        <Container>
          <Menu.Item as={Link} to='/' className={'hide-on-mobile'}>
            <img src={logo} alt='logo' style={{ marginRight: '0.75em' }} />
            <div style={{ fontSize: '20px' }}>
              <b>{systemName}</b>
            </div>
          </Menu.Item>
          {renderButtons(false)}
          <Menu.Menu position='right'>
            {userState.user ? (
              <Dropdown
                text={userState.user.username}
                pointing
                className='link item'
              >
                <Dropdown.Menu>
                  <Dropdown.Item onClick={logout}>注销</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Menu.Item
                name='登录'
                as={Link}
                to='/login'
                className='btn btn-link'
              />
            )}
          </Menu.Menu>
        </Container>
      </Menu>
    </>
  );
};

export default Header;
