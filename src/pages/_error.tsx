function Error({ statusCode }: any) {
  return (
    <p>
      {statusCode
        ? `Ocorreu um erro ${statusCode} no servidor.`
        : 'Ocorreu um erro no cliente.'}
    </p>
  )
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error;