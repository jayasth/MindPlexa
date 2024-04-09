interface Board {
  id: string;
  title: string;
  // Add more properties as needed
}

const BoardHeader = ({ board }: { board: Board }) => {
  return (
    <header>
      <h1>{board.title}</h1>
      {/* Add more board header elements */}
    </header>
  );
};

export default BoardHeader;
