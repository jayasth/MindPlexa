import Link from 'next/link';

interface Board {
  id: string;
  title: string;
  // Add more properties as needed
}

const BoardList = ({ boards }: { boards: Board[] }) => {
  return (
    <div>
      <h1>My Boards</h1>
      <ul>
        {boards.map((board) => (
          <li key={board.id}>
            <Link href={`/board/${board.id}`}>{board.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BoardList;
