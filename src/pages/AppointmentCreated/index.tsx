import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useCallback, useMemo } from 'react';
import Icon from 'react-native-vector-icons/Feather';

import {
  Container,
  Title,
  Description,
  OkButton,
  OkButtonText,
} from './styles';

interface RouteParams {
  date: number;
}

const AppointmentCreated: React.FC = () =>  {
  const navigation = useNavigation();
  const { params } = useRoute();

  const routeParams = params as RouteParams;

  const handleOkPressed = useCallback(() => {
    navigation.reset({
      routes: [{name: 'Dashboard'}],
      index: 0,
    });
  } , [navigation.reset])

  const formattedDate = useMemo(() => {
    return format(routeParams.date, "'O agendamento está marcado para: \n'EEEE', dia' dd 'de' MMMM 'de' yyyy 'as' HH:mm'h'" , { locale: ptBR })
  } , [routeParams.date])

  return(
    <Container>
      <Icon name= "check" size={80} color="#04d361" />

      <Title>Agendamento Concluído</Title>
      <Description>{formattedDate}</Description>

      <OkButton onPress={handleOkPressed}>
        <OkButtonText>OK</OkButtonText>
      </OkButton>

    </Container>

  )
};

export default AppointmentCreated;
