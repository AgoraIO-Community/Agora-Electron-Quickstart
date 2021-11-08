import React, { useState } from 'react';
import { Divider, Input, Form, Button } from 'antd';
import config from '../../config/agora.config';

interface JoinChannelBarProps {
  onPressJoin: (channelId: string) => boolean;
  onPressLeave: () => boolean;
  buttonTitle?: string;
  buttonTitleDisable?: string;
}

const JoinChannelBar = ({
  onPressJoin = () => false,
  onPressLeave = () => false,
  buttonTitle,
  buttonTitleDisable,
}: JoinChannelBarProps) => {
  const [form] = Form.useForm();
  const [isClicked, setIsClicked] = useState(false);
  return (
    <div>
      <Divider />
      <Form
        form={form}
        layout="vertical"
        onFinish={async (values: any) => {
          let isBlock = false;
          if (isClicked) {
            isBlock = await onPressLeave();
          } else {
            isBlock = await onPressJoin(values.channel);
          }

          if (!isBlock) {
            setIsClicked(!isClicked);
          }
        }}
        initialValues={{
          channel: config.defaultChannelId,
        }}
      >
        <Form.Item
          label="Channel"
          name="channel"
          required
          tooltip="This is a required field"
          rules={[
            {
              required: true,
              message: 'Please input your Channel!',
            },
          ]}
        >
          <Input
            disabled={isClicked}
            name="channel"
            placeholder="please input channel name"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" danger={isClicked}>
            {isClicked
              ? buttonTitleDisable || 'Leave Channel'
              : buttonTitle || 'Join Channel'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
export default JoinChannelBar;
