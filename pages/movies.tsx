import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import clientPromise from "../lib/mongodb";
import { GetServerSideProps } from "next";

interface Movie {
  _id: string;
  title: string;
  metacritic: number;
  plot: string;
}

interface MoviesProps {
  movies: Movie[];
}

const Movies: React.FC<MoviesProps> = ({ movies }) => {
  return (
    <div className="flex flex-col justify-center w-screen">
      <div className="flex h-fit w-full justify-center">
        <h1 className="text-4xl font-medium">
          Top 20 filmes de todos os tempos
        </h1>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {movies.map((movie) => (
          <Card key={movie._id} className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>{movie.title}</CardTitle>
              <p className="text-muted-foreground text-sm">
                Nota: {movie.metacritic}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm line-slamp-4">{movie.plot}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Movies;

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const client = await clientPromise;
    const db = client.db("sample_mflix");
    const movies = await db
      .collection("movies")
      .find({})
      .sort({ metacritic: -1 })
      .limit(20)
      .toArray();
    return {
      props: { movies: JSON.parse(JSON.stringify(movies)) },
    };
  } catch (e) {
    console.error(e);
    return { props: { movies: [] } };
  }
};
