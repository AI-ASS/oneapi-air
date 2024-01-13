import React, { useEffect, useState } from 'react';
import { API, isMobile, showError, showInfo, showSuccess } from '../../helpers';
import { renderNumber, renderQuota } from '../../helpers/render';
import { Col, Layout, Row, Typography, Card, Button, Form, Divider, Space, Modal } from "@douyinfe/semi-ui";
import Title from "@douyinfe/semi-ui/lib/es/typography/title";

const TopUp = () => {
    const [redemptionCode, setRedemptionCode] = useState('');
    const [topUpCode, setTopUpCode] = useState('');
    const [topUpCount, setTopUpCount] = useState(10);
    const [amount, setAmount] = useState(0.0);
    const [topUpLink, setTopUpLink] = useState('');
    const [userQuota, setUserQuota] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [open, setOpen] = useState(false);
    const [payWay, setPayWay] = useState('');

    const topUp = async () => {
        if (redemptionCode === '') {
            showInfo('请输入兑换码！')
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await API.post('/api/user/topup', {
                key: redemptionCode
            });
            const { success, message, data } = res.data;
            if (success) {
                showSuccess('兑换成功！');
                Modal.success({ title: '兑换成功！', content: '成功兑换额度：' + renderQuota(data), centered: true });
                setUserQuota((quota) => {
                    return quota + data;
                });
                setRedemptionCode('');
            } else {
                showError(message);
            }
        } catch (err) {
            showError('请求失败');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openTopUpLink = () => {
        if (!topUpLink) {
            showError('超级管理员未设置充值链接！');
            return;
        }
        window.open(topUpLink, '_blank');
    };

    const preTopUp = async (payment) => {
        if (amount === 0) {
            await getAmount();
        }
        setPayWay(payment)
        setOpen(true);
    }

    const getUserQuota = async () => {
        let res = await API.get(`/api/user/self`);
        const { success, message, data } = res.data;
        if (success) {
            setUserQuota(data.quota);
        } else {
            showError(message);
        }
    }

    useEffect(() => {
        let status = localStorage.getItem('status');
        if (status) {
            status = JSON.parse(status);
            if (status.top_up_link) {
                setTopUpLink(status.top_up_link);
            }
        }
        getUserQuota().then();
    }, []);

    const renderAmount = () => {
        // console.log(amount);
        return amount + '元';
    }

    const getAmount = async (value) => {
        if (value === undefined) {
            value = topUpCount;
        }
        try {
            const res = await API.post('/api/user/amount', {
                amount: parseFloat(value),
                top_up_code: topUpCode
            });
            if (res !== undefined) {
                const { message, data } = res.data;
                // showInfo(message);
                if (message === 'success') {
                    setAmount(parseFloat(data));
                } else {
                    showError(data);
                    // setTopUpCount(parseInt(res.data.count));
                    // setAmount(parseInt(data));
                }
            } else {
                showError(res);
            }
        } catch (err) {
            console.log(err);
        } finally {
        }
    }

    const handleCancel = () => {
        setOpen(false);
    }

    return (
        <div>
            <Layout>
                <Layout.Header>
                    <h3>我的钱包</h3>
                </Layout.Header>
                <Layout.Content>
                    <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
                        <Card
                            style={{ width: '500px', padding: '20px' }}
                        >
                            <Title level={3} style={{ textAlign: 'center' }}>余额 {renderQuota(userQuota)}</Title>
                            <div style={{ marginTop: 20 }}>
                                <Divider>
                                    兑换余额
                                </Divider>
                                <Form>
                                    <Form.Input
                                        field={'redemptionCode'}
                                        label={'兑换码'}
                                        placeholder='兑换码'
                                        name='redemptionCode'
                                        value={redemptionCode}
                                        onChange={(value) => {
                                            setRedemptionCode(value);
                                        }}
                                    />
                                    <Space>
                                        {
                                            topUpLink ?
                                                <Button type={'primary'} theme={'solid'} onClick={openTopUpLink}>
                                                    获取兑换码
                                                </Button> : null
                                        }
                                        <Button type={"warning"} theme={'solid'} onClick={topUp}
                                            disabled={isSubmitting}>
                                            {isSubmitting ? '兑换中...' : '兑换'}
                                        </Button>
                                    </Space>
                                </Form>
                            </div>
                        </Card>
                    </div>

                </Layout.Content>
            </Layout>
        </div>

    );
};

export default TopUp;