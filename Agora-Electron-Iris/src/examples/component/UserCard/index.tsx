import React, { useState } from 'react';
import { Row, Col, Card } from 'antd';

interface UserCardProps {
  title?: string;
}

const UserCard = ({ title = '' }: UserCardProps) => {
  const [inputValue, setInputValue] = useState(value);

  const wrapOnChange = (value) => {
    console.log(title, value);

    setInputValue(value);
  };

  return (
    <Card
      size="small"
      title={title}
      extra={<a href="#">More</a>}
      style={{ width: 300 }}
    >
      <p>Card content</p>
      <p>Card content</p>
      <p>Card content</p>
    </Card>
  );
};
export default UserCard;
